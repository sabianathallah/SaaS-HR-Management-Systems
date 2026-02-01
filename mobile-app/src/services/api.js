import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🔐 Request Interceptor:');
      console.log('  URL:', config.baseURL + config.url);
      console.log('  Method:', config.method?.toUpperCase());
      console.log('  Token:', token ? '✅ Present' : '❌ Missing');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.url, 'Status:', response.status);
    return response;
  },
  async (error) => {
    // Enhanced error logging
    console.log('❌ API Error Details:');
    console.log('  URL:', error.config?.url);
    console.log('  Method:', error.config?.method?.toUpperCase());
    console.log('  Base URL:', error.config?.baseURL);
    console.log('  Full URL:', error.config?.baseURL + error.config?.url);
    
    if (error.response) {
      // Server responded with error
      console.log('  Status:', error.response.status);
      console.log('  Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Request made but no response
      console.log('  No response received');
      console.log('  Request:', error.request);
      console.log('  Message:', error.message);
      console.log('  ⚠️  Possible causes:');
      console.log('     - Server not running');
      console.log('     - Wrong IP address/port');
      console.log('     - Network/firewall blocking connection');
      console.log('     - Device not on same network');
    } else {
      // Something else happened
      console.log('  Error:', error.message);
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      console.log('  🔐 Unauthorized - clearing token');
      await AsyncStorage.multiRemove(['token', 'user']);
      // You can use navigation here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
