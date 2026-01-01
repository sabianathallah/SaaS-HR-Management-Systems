const { Attandance, WorkSchedule } = require('../models');

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

module.exports = {
  getTodayRange,
  calculateWorkDuration,
  isLateClockIn,
  determineFinalStatus
};
