import Constants from 'expo-constants';

// API Configuration - prioritize app.json extra.apiUrl
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://172.20.10.2:3000';

console.log('🔧 ========== API CONFIGURATION ==========');
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 From expo config:', Constants.expoConfig?.extra?.apiUrl);
console.log('🔧 Platform:', Constants.platform);
console.log('🔧 ========================================');

export default {
  API_BASE_URL,
  API_ENDPOINTS: {
    // Auth
    LOGIN: '/login',
    LOGOUT: '/logout',
    
    // Profile
    PROFILE: '/profile',
    UPDATE_PROFILE: '/profile',
    CHANGE_PASSWORD: '/profile/change-password',
    
    // Attendance - FIXED: plural routes matching backend
    ATTENDANCE_TODAY: '/attendances/today-attendance',
    ATTENDANCE_HISTORY: '/attendances/my-attendance',
    ATTENDANCE_STATISTICS: '/attendances/my-statistics',
    CLOCK_IN: '/attendances/clock-in',
    CLOCK_OUT: '/attendances/clock-out',
    
    // Leave
    LEAVE_REQUESTS: '/leave-requests/my-requests',
    LEAVE_BALANCE: '/leave-requests/my-balance',
    LEAVE_CREATE: '/leave-requests',
    LEAVE_CANCEL: (id) => `/leave-requests/${id}`,
    
    // Overtime - FIXED: plural routes matching backend
    OVERTIME_REQUESTS: '/overtimes/my-requests',
    OVERTIME_HISTORY: '/overtimes/my-history',
    OVERTIME_CREATE: '/overtimes/request',
    OVERTIME_CANCEL: (id) => `/overtimes/${id}`,
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    NOTIFICATIONS_MARK_READ: (id) => `/notifications/${id}/read`,
    NOTIFICATIONS_MARK_ALL_READ: '/notifications/read-all',
    NOTIFICATIONS_CLEAR_READ: '/notifications/clear-read',
    NOTIFICATIONS_DELETE: (id) => `/notifications/${id}`,
    
    // Payroll
    PAYROLL_PAYSLIPS: '/payroll/my-payslips',
    PAYROLL_SUMMARY: '/payroll/my-payslips/summary',
    PAYROLL_DETAIL: (id) => `/payroll/my-payslips/${id}`,
    PAYROLL_DOWNLOAD: (id) => `/payroll/my-payslips/${id}/download`,
  },
};
