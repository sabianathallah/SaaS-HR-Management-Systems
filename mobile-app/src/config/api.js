import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * 🚀 SMART API URL CONFIGURATION
 * 
 * Prioritas URL (dari tertinggi):
 * 1. app.json extra.apiUrl (untuk production/custom URL)
 * 2. localhost untuk iOS Simulator
 * 3. 10.0.2.2 untuk Android Emulator
 * 4. Auto-detect dari Expo manifest untuk physical device
 * 
 * 💡 SOLUSI GANTI JARINGAN:
 * - Gunakan: npx expo start --tunnel (RECOMMENDED)
 * - Atau: npx expo start --lan
 * - Ngrok: Set URL di app.json extra.apiUrl
 */

const getApiUrl = () => {
  // Priority 1: Custom URL dari app.json
  if (Constants.expoConfig?.extra?.apiUrl) {
    console.log('📍 Using custom API URL from app.json');
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // Priority 2: iOS Simulator - use computer's IP
  if (Platform.OS === 'ios' && !Constants.isDevice) {
    console.log('📱 iOS Simulator detected');
    // iOS Simulator bisa akses localhost, tapi kalo ga jalan pake IP host
    const host = Constants.expoConfig?.hostUri?.split(':').shift();
    if (host) {
      return `http://${host}:3000`;
    }
    return 'http://localhost:3000';
  }
  
  // Priority 3: Android Emulator
  if (Platform.OS === 'android' && !Constants.isDevice) {
    console.log('🤖 Android Emulator detected');
    return 'http://10.0.2.2:3000';
  }
  
  // Priority 4: Physical Device - Auto-detect from Expo manifest
  if (Constants.expoConfig?.hostUri) {
    const host = Constants.expoConfig.hostUri.split(':').shift();
    const apiUrl = `http://${host}:3000`;
    console.log('📡 Physical device - auto-detected from Expo');
    return apiUrl;
  }
  
  // Fallback - gunakan tunnel atau LAN mode
  console.warn('⚠️  Could not auto-detect IP. Use: npx expo start --tunnel');
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiUrl();

console.log('🔧 ========== API CONFIGURATION ==========');
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 Platform:', Platform.OS);
console.log('🔧 Is Device:', Constants.isDevice);
console.log('🔧 Expo Host:', Constants.expoConfig?.hostUri);
console.log('🔧 Custom URL:', Constants.expoConfig?.extra?.apiUrl || 'Not set');
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
