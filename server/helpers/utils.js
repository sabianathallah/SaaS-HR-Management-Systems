/**
 * Utility Helper Functions
 * Pure functions tanpa dependency ke model database
 */

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
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {String} Formatted date
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Check if two dates are the same day
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {Boolean}
 */
const isSameDay = (date1, date2) => {
  return formatDate(date1) === formatDate(date2);
};

/**
 * Get number of days between two dates
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Number} Number of days
 */
const getDaysBetween = (startDate, endDate) => {
  const diffMs = new Date(endDate) - new Date(startDate);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

module.exports = {
  getTodayRange,
  calculateWorkDuration,
  getWeekNumber,
  getDateRangeForPeriod,
  formatDate,
  isSameDay,
  getDaysBetween
};
