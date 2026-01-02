const { Attandance, WorkSchedule, User, Holiday } = require('../models');
const { Op } = require('sequelize');

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
 * @returns {Boolean} true jika terlambat, false jika tepat waktu
 */
const isLateClockIn = async (clockInTime) => {
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
 * @returns {String} Status final (ON_TIME atau LATE)
 */
const determineFinalStatus = async (clockInTime) => {
  const isLate = await isLateClockIn(clockInTime);
  return isLate 
    ? Attandance.ATTENDANCE_STATUS.LATE 
    : Attandance.ATTENDANCE_STATUS.ON_TIME;
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
  const attendedUserIds = await Attandance.findAll({
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
          Attandance.create({
            UserId: user.id,
            WorkScheduleId: workSchedule ? workSchedule.id : null,
            HolidayId: holiday.id, // Save reference to holiday
            date: new Date(),
            clockIn: new Date(),
            clockOut: new Date(),
            status: Attandance.ATTENDANCE_STATUS.HOLIDAY
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
        Attandance.create({
          UserId: user.id,
          WorkScheduleId: workSchedule ? workSchedule.id : null,
          HolidayId: null,
          date: new Date(),
          clockIn: new Date(),
          clockOut: new Date(),
          status: Attandance.ATTENDANCE_STATUS.ABSENT
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
  const attendances = await Attandance.findAll({
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
  let holidayCount = 0;
  let totalWorkHours = 0;

  // Count by status dan hitung total jam kerja
  attendances.forEach(att => {
    switch (att.status) {
      case Attandance.ATTENDANCE_STATUS.ON_TIME:
        onTimeCount++;
        if (att.clockIn && att.clockOut) {
          totalWorkHours += calculateWorkDuration(att.clockIn, att.clockOut);
        }
        break;
      case Attandance.ATTENDANCE_STATUS.LATE:
        lateCount++;
        if (att.clockIn && att.clockOut) {
          totalWorkHours += calculateWorkDuration(att.clockIn, att.clockOut);
        }
        break;
      case Attandance.ATTENDANCE_STATUS.ABSENT:
        absentCount++;
        break;
      case Attandance.ATTENDANCE_STATUS.LEAVE:
        leaveCount++;
        break;
      case Attandance.ATTENDANCE_STATUS.HOLIDAY:
        holidayCount++;
        break;
    }
  });

  // Hitung total hari kerja (tidak termasuk holiday)
  const totalPresent = onTimeCount + lateCount;
  const totalWorkDays = totalPresent + absentCount + leaveCount; // Exclude holidays
  
  // Hitung persentase kehadiran (tidak termasuk holiday dan leave)
  const effectiveWorkDays = totalPresent + absentCount; // Days that should be worked
  const attendanceRate = effectiveWorkDays > 0 
    ? ((totalPresent / effectiveWorkDays) * 100).toFixed(2) 
    : 0;

  return {
    month,
    year,
    summary: {
      totalRecords: attendances.length,
      totalPresent: totalPresent, // ON_TIME + LATE
      onTime: onTimeCount,
      late: lateCount,
      absent: absentCount,
      leave: leaveCount,
      holiday: holidayCount,
      totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
      attendanceRate: parseFloat(attendanceRate), // Persentase kehadiran (exclude holiday & leave)
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

module.exports = {
  getTodayRange,
  calculateWorkDuration,
  isLateClockIn,
  determineFinalStatus,
  processAutoSetAbsent,
  calculateAttendanceStatistics
};
