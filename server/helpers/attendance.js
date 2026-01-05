const { Attendance, WorkSchedule, User, Holiday, Shift } = require('../models');
const { Op } = require('sequelize');
const { 
  getApplicableShift, 
  isLateClockInWithShift, 
  calculateOvertimeWithShift,
  calculateWorkDurationWithBreak,
  determineStatusWithShift 
} = require('./shift');

/**
 * Helper function untuk mendapatkan start dan end of day
 * @returns {Object} { startOfDay, endOfDay }
 */
const getTodayRange = () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  return { startOfDay, endOfDay };
};

/**
 * Helper function untuk menghitung durasi kerja dalam jam
 * @param {Date} clockIn - Waktu clock-in
 * @param {Date} clockOut - Waktu clock-out
 * @returns {Number} Durasi kerja dalam jam (2 desimal)
 */
const calculateWorkDuration = (clockIn, clockOut) => {
  const diffMs = new Date(clockOut) - new Date(clockIn);
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
};

/**
 * Helper function untuk cek apakah clock-in terlambat
 * @param {Date} clockInTime - Waktu clock-in
 * @param {Number} userId - User ID (optional, untuk cek shift user)
 * @param {Object} shift - Shift object (optional, jika sudah ada)
 * @returns {Boolean} true jika terlambat, false jika tepat waktu
 */
const isLateClockIn = async (clockInTime, userId = null, shift = null) => {
  // Jika shift sudah diberikan, gunakan shift helper
  if (shift) {
    const { isLate } = isLateClockInWithShift(clockInTime, shift);
    return isLate;
  }
  
  // Jika ada userId, cari shift user
  if (userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: Shift, as: 'shift' }]
    });
    
    const applicableShift = await getApplicableShift(null, user);
    if (applicableShift) {
      const { isLate } = isLateClockInWithShift(clockInTime, applicableShift);
      return isLate;
    }
  }
  
  // Fallback ke logic lama (WorkSchedule)
  const clockIn = new Date(clockInTime);
  const workStartTime = new Date(clockIn);
  
  // Get work start time from database
  const workSchedule = await WorkSchedule.findOne({
    where: { isActive: true }
  });
  
  let startHour = 9;
  let startMinute = 0;
  
  if (workSchedule && workSchedule.workStartTime) {
    const [hour, minute] = workSchedule.workStartTime.split(':');
    startHour = parseInt(hour);
    startMinute = parseInt(minute);
  }
  
  workStartTime.setHours(startHour, startMinute, 0, 0);
  
  return clockIn > workStartTime;
};

/**
 * Helper function untuk determine final status
 * @param {Date} clockInTime - Waktu clock-in
 * @param {Number} userId - User ID (optional)
 * @param {Object} shift - Shift object (optional)
 * @returns {String} Status final (ON_TIME atau LATE)
 */
const determineFinalStatus = async (clockInTime, userId = null, shift = null) => {
  const isLate = await isLateClockIn(clockInTime, userId, shift);
  return isLate 
    ? Attendance.ATTENDANCE_STATUS.LATE 
    : Attendance.ATTENDANCE_STATUS.ON_TIME;
};

/**
 * Core logic untuk auto set absent (reusable)
 * Digunakan oleh cron job dan admin endpoint
 * @returns {Object} { absentCount, absentUserIds, isHoliday, holidayDescription, workScheduleId, holidayId }
 */
const processAutoSetAbsent = async () => {
  // Check if today is a holiday
  const today = new Date();
  const todayDateOnly = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  const holiday = await Holiday.findOne({
    where: {
      date: todayDateOnly,
      isActive: true
    }
  });

  // Get active work schedule
  const workSchedule = await WorkSchedule.findOne({
    where: { isActive: true }
  });

  const { startOfDay, endOfDay } = getTodayRange();
  
  // Get all users
  const allUsers = await User.findAll({
    attributes: ['id', 'email']
  });
  
  // Get users yang sudah clock-in hari ini
  const attendedUserIds = await Attendance.findAll({
    where: {
      date: {
        [Op.between]: [startOfDay, endOfDay]
      }
    },
    attributes: ['UserId']
  });
  
  const attendedIds = attendedUserIds.map(a => a.UserId);
  const usersWithoutRecord = allUsers.filter(user => !attendedIds.includes(user.id));
  
  // If it's a holiday, mark as HOLIDAY
  if (holiday) {
    if (usersWithoutRecord.length > 0) {
      await Promise.all(
        usersWithoutRecord.map(user => 
          Attendance.create({
            UserId: user.id,
            WorkScheduleId: workSchedule ? workSchedule.id : null,
            HolidayId: holiday.id, // Save reference to holiday
            date: new Date(),
            clockIn: new Date(),
            clockOut: new Date(),
            status: Attendance.ATTENDANCE_STATUS.HOLIDAY
          })
        )
      );
    }
    
    return {
      isHoliday: true,
      holidayDescription: holiday.description,
      holidayId: holiday.id,
      workScheduleId: workSchedule ? workSchedule.id : null,
      absentCount: usersWithoutRecord.length,
      absentUserIds: usersWithoutRecord.map(u => u.id),
      absentUserEmails: usersWithoutRecord.map(u => u.email)
    };
  }
  
  // If not a holiday, mark as ABSENT
  if (usersWithoutRecord.length > 0) {
    await Promise.all(
      usersWithoutRecord.map(user => 
        Attendance.create({
          UserId: user.id,
          WorkScheduleId: workSchedule ? workSchedule.id : null,
          HolidayId: null,
          date: new Date(),
          clockIn: new Date(),
          clockOut: new Date(),
          status: Attendance.ATTENDANCE_STATUS.ABSENT
        })
      )
    );
  }
  
  return {
    isHoliday: false,
    holidayDescription: null,
    holidayId: null,
    workScheduleId: workSchedule ? workSchedule.id : null,
    absentCount: usersWithoutRecord.length,
    absentUserIds: usersWithoutRecord.map(u => u.id),
    absentUserEmails: usersWithoutRecord.map(u => u.email)
  };
};

/**
 * Helper function untuk menghitung statistik attendance
 * @param {Number} userId - ID user yang akan dihitung statistiknya
 * @param {Number} month - Bulan (1-12)
 * @param {Number} year - Tahun
 * @returns {Object} Statistics data
 */
const calculateAttendanceStatistics = async (userId, month, year) => {
  // Set date range untuk bulan tersebut
  const startDate = new Date(year, month - 1, 1); // month - 1 karena JS month 0-indexed
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Day 0 = hari terakhir bulan sebelumnya
  
  // Get all attendance records untuk user di bulan tersebut
  const attendances = await Attendance.findAll({
    where: {
      UserId: userId,
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'ASC']]
  });

  // Initialize counters
  let onTimeCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let sickLeaveCount = 0;
  let permissionCount = 0;
  let holidayCount = 0;
  let totalWorkHours = 0;

  // Count by status dan hitung total jam kerja
  attendances.forEach(att => {
    switch (att.status) {
      case Attendance.ATTENDANCE_STATUS.ON_TIME:
        onTimeCount++;
        if (att.clockIn && att.clockOut) {
          totalWorkHours += calculateWorkDuration(att.clockIn, att.clockOut);
        }
        break;
      case Attendance.ATTENDANCE_STATUS.LATE:
        lateCount++;
        if (att.clockIn && att.clockOut) {
          totalWorkHours += calculateWorkDuration(att.clockIn, att.clockOut);
        }
        break;
      case Attendance.ATTENDANCE_STATUS.ABSENT:
        absentCount++;
        break;
      case Attendance.ATTENDANCE_STATUS.LEAVE:
        leaveCount++;
        break;
      case Attendance.ATTENDANCE_STATUS.SICK_LEAVE:
        sickLeaveCount++;
        break;
      case Attendance.ATTENDANCE_STATUS.PERMISSION:
        permissionCount++;
        break;
      case Attendance.ATTENDANCE_STATUS.HOLIDAY:
        holidayCount++;
        break;
    }
  });

  // Hitung total hari kerja (tidak termasuk holiday)
  const totalPresent = onTimeCount + lateCount + permissionCount; // Permission count as present
  const totalWorkDays = totalPresent + absentCount + leaveCount + sickLeaveCount; // Exclude holidays
  
  // Hitung persentase kehadiran (tidak termasuk holiday, leave, dan sick leave)
  const effectiveWorkDays = totalPresent + absentCount; // Days that should be worked
  const attendanceRate = effectiveWorkDays > 0 
    ? ((totalPresent / effectiveWorkDays) * 100).toFixed(2) 
    : 0;

  return {
    month,
    year,
    summary: {
      totalRecords: attendances.length,
      totalPresent: totalPresent, // ON_TIME + LATE + PERMISSION
      onTime: onTimeCount,
      late: lateCount,
      absent: absentCount,
      leave: leaveCount,
      sickLeave: sickLeaveCount,
      permission: permissionCount,
      holiday: holidayCount,
      totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
      attendanceRate: parseFloat(attendanceRate), // Persentase kehadiran (exclude holiday, leave, sick leave)
      totalWorkDays: totalWorkDays // Total hari yang seharusnya kerja (exclude holiday)
    },
    details: attendances.map(att => ({
      date: att.date,
      clockIn: att.clockIn,
      clockOut: att.clockOut,
      status: att.status,
      workHours: (att.clockIn && att.clockOut) 
        ? calculateWorkDuration(att.clockIn, att.clockOut) 
        : 0
    }))
  };
};

/**
 * Get date range for different period types
 * @param {String} period - 'daily', 'weekly', 'monthly', 'custom'
 * @param {String} startDate - For custom range (YYYY-MM-DD)
 * @param {String} endDate - For custom range (YYYY-MM-DD)
 * @param {Number} month - For monthly (1-12)
 * @param {Number} year - For monthly and weekly
 * @param {Number} week - For weekly (1-52)
 * @returns {Object} { startDate, endDate, periodLabel }
 */
const getDateRangeForPeriod = (period, options = {}) => {
  const { startDate, endDate, month, year, week } = options;
  const now = new Date();
  
  let start, end, periodLabel;

  switch (period) {
    case 'daily':
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      periodLabel = `Daily - ${start.toISOString().split('T')[0]}`;
      break;

    case 'weekly':
      const targetYear = year || now.getFullYear();
      const targetWeek = week || getWeekNumber(now);
      
      // Get first day of year
      const firstDayOfYear = new Date(targetYear, 0, 1);
      const daysOffset = (targetWeek - 1) * 7;
      
      start = new Date(firstDayOfYear);
      start.setDate(firstDayOfYear.getDate() + daysOffset);
      // Adjust to Monday
      const dayOfWeek = start.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(start.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);
      
      end = new Date(start);
      end.setDate(start.getDate() + 6); // Sunday
      end.setHours(23, 59, 59, 999);
      
      periodLabel = `Week ${targetWeek}, ${targetYear}`;
      break;

    case 'monthly':
      const targetMonth = month || (now.getMonth() + 1);
      const targetMonthYear = year || now.getFullYear();
      
      start = new Date(targetMonthYear, targetMonth - 1, 1);
      start.setHours(0, 0, 0, 0);
      
      end = new Date(targetMonthYear, targetMonth, 0); // Last day of month
      end.setHours(23, 59, 59, 999);
      
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      periodLabel = `${monthNames[targetMonth - 1]} ${targetMonthYear}`;
      break;

    case 'custom':
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required for custom period');
      }
      
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      if (start > end) {
        throw new Error('Start date must be before or equal to end date');
      }
      
      periodLabel = `Custom: ${startDate} to ${endDate}`;
      break;

    default:
      throw new Error('Invalid period type. Use: daily, weekly, monthly, or custom');
  }

  return {
    startDate: start,
    endDate: end,
    periodLabel
  };
};

/**
 * Get week number of the year
 * @param {Date} date 
 * @returns {Number} Week number (1-52)
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Calculate attendance summary for a specific period
 * @param {Number} userId - User ID (optional, if null calculate for all users)
 * @param {String} period - 'daily', 'weekly', 'monthly', 'custom'
 * @param {Object} options - Period options (month, year, week, startDate, endDate)
 * @returns {Object} Summary statistics
 */
const calculateAttendanceSummaryByPeriod = async (userId, period, options = {}) => {
  const { startDate, endDate, periodLabel } = getDateRangeForPeriod(period, options);

  const whereClause = {
    date: {
      [Op.between]: [startDate, endDate]
    }
  };

  if (userId) {
    whereClause.UserId = userId;
  }

  const attendances = await Attendance.findAll({
    where: whereClause,
    include: userId ? [] : [{
      model: User,
      attributes: ['id', 'name', 'email']
    }],
    order: [['date', 'ASC']]
  });

  // Initialize counters
  let onTimeCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let sickLeaveCount = 0;
  let permissionCount = 0;
  let holidayCount = 0;
  let totalWorkHours = 0;

  // Count by status
  attendances.forEach(att => {
    switch (att.status) {
      case Attendance.ATTENDANCE_STATUS.ON_TIME:
        onTimeCount++;
        if (att.clockIn && att.clockOut) {
          totalWorkHours += calculateWorkDuration(att.clockIn, att.clockOut);
        }
        break;
      case Attendance.ATTENDANCE_STATUS.LATE:
        lateCount++;
        if (att.clockIn && att.clockOut) {
          totalWorkHours += calculateWorkDuration(att.clockIn, att.clockOut);
        }
        break;
      case Attendance.ATTENDANCE_STATUS.ABSENT:
        absentCount++;
        break;
      case Attendance.ATTENDANCE_STATUS.LEAVE:
        leaveCount++;
        break;
      case Attendance.ATTENDANCE_STATUS.SICK_LEAVE:
        sickLeaveCount++;
        break;
      case Attendance.ATTENDANCE_STATUS.PERMISSION:
        permissionCount++;
        break;
      case Attendance.ATTENDANCE_STATUS.HOLIDAY:
        holidayCount++;
        break;
    }
  });

  // Calculate totals
  const totalPresent = onTimeCount + lateCount + permissionCount;
  const totalWorkDays = totalPresent + absentCount + leaveCount + sickLeaveCount;
  const effectiveWorkDays = totalPresent + absentCount;
  const attendanceRate = effectiveWorkDays > 0 
    ? ((totalPresent / effectiveWorkDays) * 100).toFixed(2) 
    : 0;

  return {
    period: periodLabel,
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    },
    summary: {
      totalRecords: attendances.length,
      totalPresent: totalPresent,
      onTime: onTimeCount,
      late: lateCount,
      absent: absentCount,
      leave: leaveCount,
      sickLeave: sickLeaveCount,
      permission: permissionCount,
      holiday: holidayCount,
      totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
      attendanceRate: parseFloat(attendanceRate),
      totalWorkDays: totalWorkDays
    },
    details: attendances.map(att => ({
      id: att.id,
      userId: att.UserId,
      userName: att.User ? att.User.name : undefined,
      date: att.date,
      clockIn: att.clockIn,
      clockOut: att.clockOut,
      status: att.status,
      workHours: (att.clockIn && att.clockOut) 
        ? calculateWorkDuration(att.clockIn, att.clockOut) 
        : 0
    }))
  };
};

module.exports = {
  getTodayRange,
  calculateWorkDuration,
  isLateClockIn,
  determineFinalStatus,
  processAutoSetAbsent,
  calculateAttendanceStatistics,
  getDateRangeForPeriod,
  getWeekNumber,
  calculateAttendanceSummaryByPeriod
};
