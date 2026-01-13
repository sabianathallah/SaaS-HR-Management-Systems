/**
 * Report Helper Functions
 * Utility functions untuk generate reports dan export data
 */

/**
 * Calculate work hours between clock in and clock out
 * @param {Date|String} clockIn - Clock in datetime
 * @param {Date|String} clockOut - Clock out datetime
 * @returns {String} Work hours in decimal format (e.g., "8.50")
 */
function calculateWorkHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0;
  const diff = new Date(clockOut) - new Date(clockIn);
  return (diff / (1000 * 60 * 60)).toFixed(2);
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date|String} date - Date to format
 * @returns {String} Formatted date string
 */
function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Format datetime to Indonesian locale
 * @param {Date|String} datetime - Datetime to format
 * @returns {String} Formatted datetime string (e.g., "06/01/2026, 15.30.00")
 */
function formatDateTime(datetime) {
  if (!datetime) return '-';
  const d = new Date(datetime);
  return d.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Get month name from month number
 * @param {Number} month - Month number (1-12)
 * @returns {String} Month name in English
 */
function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Invalid Month';
}

/**
 * Calculate attendance statistics for an array of attendance records
 * @param {Array} attendances - Array of attendance objects
 * @returns {Object} Statistics object with counts and percentages
 */
function calculateAttendanceStats(attendances) {
  const stats = {
    totalDays: attendances.length,
    onTime: 0,
    late: 0,
    absent: 0,
    leave: 0,
    present: 0,
    totalWorkHours: 0,
    averageWorkHours: 0,
    attendanceRate: 0
  };

  attendances.forEach(att => {
    if (att.status === 'ON_TIME' || att.status === 'PRESENT') {
      stats.onTime++;
      stats.present++;
    } else if (att.status === 'LATE') {
      stats.late++;
      stats.present++;
    } else if (att.status === 'ABSENT') {
      stats.absent++;
    } else if (['LEAVE', 'SICK_LEAVE', 'PERMISSION'].includes(att.status)) {
      stats.leave++;
    }

    stats.totalWorkHours += parseFloat(calculateWorkHours(att.clockIn, att.clockOut));
  });

  const workingDays = stats.totalDays - stats.leave;
  
  stats.averageWorkHours = workingDays > 0 ? (stats.totalWorkHours / workingDays).toFixed(2) : '0.00';
  stats.attendanceRate = workingDays > 0 ? ((stats.present / workingDays) * 100).toFixed(2) : '0.00';
  stats.totalWorkHours = stats.totalWorkHours.toFixed(2);

  return stats;
}

/**
 * Group attendances by user ID and calculate stats per user
 * @param {Array} attendances - Array of attendance objects with User include
 * @returns {Array} Array of user statistics
 */
function groupAttendancesByUser(attendances) {
  const userStatsMap = {};

  attendances.forEach(att => {
    const userId = att.UserId;

    if (!userStatsMap[userId]) {
      userStatsMap[userId] = {
        userId: userId,
        userName: att.User?.name || 'Unknown',
        userEmail: att.User?.email || '-',
        totalDays: 0,
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        workHours: 0,
        attendances: []
      };
    }

    const stats = userStatsMap[userId];
    stats.totalDays++;
    stats.attendances.push(att);

    if (att.status === 'ON_TIME' || att.status === 'PRESENT') {
      stats.present++;
    } else if (att.status === 'LATE') {
      stats.late++;
      stats.present++;
    } else if (att.status === 'ABSENT') {
      stats.absent++;
    } else if (['LEAVE', 'SICK_LEAVE', 'PERMISSION'].includes(att.status)) {
      stats.leave++;
    }

    stats.workHours += parseFloat(calculateWorkHours(att.clockIn, att.clockOut));
  });

  // Calculate attendance rate for each user
  return Object.values(userStatsMap).map(stats => {
    const workingDays = stats.totalDays - stats.leave;
    const attendanceRate = workingDays > 0 ? ((stats.present / workingDays) * 100).toFixed(2) : '0.00';
    return {
      ...stats,
      workHours: stats.workHours.toFixed(2),
      attendanceRate
    };
  });
}

/**
 * Calculate status breakdown from attendances
 * @param {Array} attendances - Array of attendance objects
 * @returns {Object} Object with status counts
 */
function calculateStatusBreakdown(attendances) {
  return attendances.reduce((acc, att) => {
    acc[att.status] = (acc[att.status] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Get date range for current month
 * @returns {Object} Object with startDate and endDate
 */
function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startDate: firstDay, endDate: lastDay };
}

/**
 * Get date range for specific month and year
 * @param {Number} month - Month number (1-12)
 * @param {Number} year - Year (e.g., 2026)
 * @returns {Object} Object with startDate and endDate
 */
function getMonthRange(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  return { startDate, endDate };
}

/**
 * Validate month and year parameters
 * @param {Number} month - Month number (1-12)
 * @param {Number} year - Year
 * @returns {Object} Validation result with isValid and error message
 */
function validateMonthYear(month, year) {
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return {
      isValid: false,
      error: 'Month must be a number between 1 and 12'
    };
  }

  if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
    return {
      isValid: false,
      error: 'Year must be a valid number between 2000 and 2100'
    };
  }

  return { isValid: true };
}

/**
 * Format file name for export with timestamp
 * @param {String} prefix - File name prefix
 * @param {String} extension - File extension (without dot)
 * @returns {String} Formatted filename
 */
function generateFileName(prefix, extension) {
  const timestamp = Date.now();
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Convert attendance data to CSV format structure
 * @param {Array} attendances - Array of attendance objects
 * @returns {Array} Array of objects ready for CSV conversion
 */
function prepareCSVData(attendances) {
  return attendances.map(att => ({
    'User ID': att.UserId,
    'Employee Name': att.User?.name || '-',
    'Email': att.User?.email || '-',
    'Position': att.User?.position || '-',
    'Department': att.User?.department || '-',
    'Date': formatDate(att.date),
    'Clock In': formatDateTime(att.clockIn),
    'Clock Out': formatDateTime(att.clockOut),
    'Status': att.status,
    'Work Hours': calculateWorkHours(att.clockIn, att.clockOut)
  }));
}

module.exports = {
  calculateWorkHours,
  formatDate,
  formatDateTime,
  getMonthName,
  calculateAttendanceStats,
  groupAttendancesByUser,
  calculateStatusBreakdown,
  getCurrentMonthRange,
  getMonthRange,
  validateMonthYear,
  generateFileName,
  prepareCSVData
};
