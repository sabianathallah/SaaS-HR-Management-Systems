const { Shift } = require('../models');

/**
 * Helper untuk mendapatkan shift yang tepat untuk user dan attendance
 * Priority: Attendance.ShiftId > User.ShiftId > Default shift
 * @param {Object} attendance - Attendance object (optional)
 * @param {Object} user - User object (optional)
 * @returns {Object|null} Shift object atau null
 */
const getApplicableShift = async (attendance = null, user = null) => {
  // Priority 1: Shift dari attendance (jika ada override)
  if (attendance && attendance.ShiftId) {
    return await Shift.findByPk(attendance.ShiftId);
  }
  
  // Priority 2: Shift dari user (shift default user)
  if (user && user.ShiftId) {
    return await Shift.findByPk(user.ShiftId);
  }
  
  // Priority 3: Shift default pertama yang aktif (fallback)
  const defaultShift = await Shift.findOne({
    where: { 
      isActive: true,
      isFlexible: false 
    },
    order: [['id', 'ASC']]
  });
  
  return defaultShift;
};

/**
 * Helper untuk cek apakah clock-in terlambat berdasarkan shift
 * @param {Date} clockInTime - Waktu clock-in
 * @param {Object} shift - Shift object
 * @returns {Object} { isLate: Boolean, lateMinutes: Number }
 */
const isLateClockInWithShift = (clockInTime, shift) => {
  // Jika shift flexible, tidak ada keterlambatan
  if (!shift || shift.isFlexible) {
    return { isLate: false, lateMinutes: 0 };
  }
  
  const clockIn = new Date(clockInTime);
  
  // Parse shift start time (format: "HH:mm:ss" or "HH:mm")
  const [startHour, startMinute] = shift.startTime.split(':').map(num => parseInt(num));
  
  // Set expected start time
  const expectedStartTime = new Date(clockIn);
  expectedStartTime.setHours(startHour, startMinute, 0, 0);
  
  // Add late tolerance
  const toleranceMs = shift.lateTolerance * 60 * 1000; // Convert minutes to milliseconds
  const lateThreshold = new Date(expectedStartTime.getTime() + toleranceMs);
  
  // Calculate late minutes
  const diffMs = clockIn - expectedStartTime;
  const lateMinutes = Math.max(0, Math.floor(diffMs / (60 * 1000)));
  
  return {
    isLate: clockIn > lateThreshold,
    lateMinutes: lateMinutes,
    expectedStartTime: expectedStartTime,
    actualStartTime: clockIn,
    tolerance: shift.lateTolerance
  };
};

/**
 * Helper untuk menghitung overtime berdasarkan shift
 * @param {Date} clockInTime - Waktu clock-in
 * @param {Date} clockOutTime - Waktu clock-out
 * @param {Object} shift - Shift object
 * @returns {Object} { hasOvertime: Boolean, overtimeMinutes: Number, overtimeHours: Number }
 */
const calculateOvertimeWithShift = (clockInTime, clockOutTime, shift) => {
  // Jika tidak ada shift atau flexible, tidak ada overtime otomatis
  if (!shift) {
    return { 
      hasOvertime: false, 
      overtimeMinutes: 0, 
      overtimeHours: 0,
      expectedEndTime: null,
      actualEndTime: clockOutTime
    };
  }
  
  const clockOut = new Date(clockOutTime);
  
  // Parse shift end time
  const [endHour, endMinute] = shift.endTime.split(':').map(num => parseInt(num));
  
  // Set expected end time
  const expectedEndTime = new Date(clockOut);
  expectedEndTime.setHours(endHour, endMinute, 0, 0);
  
  // If shift ends next day (e.g., night shift 22:00 - 06:00)
  // Detect if end time is "earlier" than start time
  const [startHour] = shift.startTime.split(':').map(num => parseInt(num));
  if (endHour < startHour) {
    // Add one day to expected end time
    expectedEndTime.setDate(expectedEndTime.getDate() + 1);
  }
  
  // Calculate overtime minutes
  const diffMs = clockOut - expectedEndTime;
  const overtimeMinutes = Math.max(0, Math.floor(diffMs / (60 * 1000)));
  
  // Check if overtime exceeds threshold
  const hasOvertime = overtimeMinutes >= shift.overtimeThreshold;
  
  return {
    hasOvertime: hasOvertime,
    overtimeMinutes: overtimeMinutes,
    overtimeHours: Math.round((overtimeMinutes / 60) * 100) / 100, // Round to 2 decimals
    expectedEndTime: expectedEndTime,
    actualEndTime: clockOut,
    threshold: shift.overtimeThreshold
  };
};

/**
 * Helper untuk menghitung work duration dengan break time
 * @param {Date} clockInTime - Waktu clock-in
 * @param {Date} clockOutTime - Waktu clock-out
 * @param {Object} shift - Shift object
 * @returns {Object} { totalMinutes: Number, totalHours: Number, breakMinutes: Number, workMinutes: Number }
 */
const calculateWorkDurationWithBreak = (clockInTime, clockOutTime, shift) => {
  const diffMs = new Date(clockOutTime) - new Date(clockInTime);
  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  
  // Get break duration from shift or default to 60 minutes
  const breakMinutes = shift && shift.breakDuration ? shift.breakDuration : 60;
  
  // Net work minutes (minus break)
  const workMinutes = Math.max(0, totalMinutes - breakMinutes);
  
  return {
    totalMinutes: totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    breakMinutes: breakMinutes,
    workMinutes: workMinutes,
    workHours: Math.round((workMinutes / 60) * 100) / 100
  };
};

/**
 * Helper untuk determine status berdasarkan shift
 * @param {Date} clockInTime - Waktu clock-in
 * @param {Object} shift - Shift object
 * @returns {String} Status (ON_TIME atau LATE)
 */
const determineStatusWithShift = (clockInTime, shift) => {
  const { isLate } = isLateClockInWithShift(clockInTime, shift);
  return isLate ? 'LATE' : 'ON_TIME';
};

/**
 * Helper untuk format shift time untuk display
 * @param {Object} shift - Shift object
 * @returns {String} Formatted shift time "08:00 - 17:00"
 */
const formatShiftTime = (shift) => {
  if (!shift) return 'No shift assigned';
  
  // Remove seconds if present
  const startTime = shift.startTime.substring(0, 5);
  const endTime = shift.endTime.substring(0, 5);
  
  return `${startTime} - ${endTime}`;
};

module.exports = {
  getApplicableShift,
  isLateClockInWithShift,
  calculateOvertimeWithShift,
  calculateWorkDurationWithBreak,
  determineStatusWithShift,
  formatShiftTime
};
