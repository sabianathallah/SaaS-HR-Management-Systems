import { format as dateFnsFormat } from 'date-fns';
import { DATE_FORMATS } from '../constant';

/**
 * Format date to display format
 */
export const formatDate = (date, formatString = DATE_FORMATS.DISPLAY) => {
  if (!date) return '-';
  try {
    return dateFnsFormat(new Date(date), formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

/**
 * Format time to HH:mm
 */
export const formatTime = (time) => {
  if (!time) return '-';
  return time;
};

/**
 * Get current date in API format
 */
export const getCurrentDate = () => {
  return dateFnsFormat(new Date(), DATE_FORMATS.API);
};

/**
 * Get current time
 */
export const getCurrentTime = () => {
  return dateFnsFormat(new Date(), DATE_FORMATS.TIME);
};

/**
 * Calculate days between two dates
 */
export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end date
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Get greeting based on time
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};
