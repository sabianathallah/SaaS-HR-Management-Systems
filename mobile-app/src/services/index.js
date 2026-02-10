import api from './api';
import config from '../config/api';

// Auth Service
export const authService = {
  login: async (email, password) => {
    const response = await api.post(config.API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post(config.API_ENDPOINTS.LOGOUT);
    return response.data;
  },
};

// Profile Service
export const profileService = {
  getProfile: async () => {
    const response = await api.get(config.API_ENDPOINTS.PROFILE);
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put(config.API_ENDPOINTS.UPDATE_PROFILE, data);
    return response.data;
  },
  
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    const response = await api.post(config.API_ENDPOINTS.CHANGE_PASSWORD, {
      oldPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

// Attendance Service
export const attendanceService = {
  getTodayAttendance: async () => {
    const response = await api.get(config.API_ENDPOINTS.ATTENDANCE_TODAY);
    return response.data;
  },
  
  getAttendanceHistory: async () => {
    const response = await api.get(config.API_ENDPOINTS.ATTENDANCE_HISTORY);
    return response.data;
  },
  
  getAttendanceStatistics: async (period, month, year) => {
    const response = await api.get(config.API_ENDPOINTS.ATTENDANCE_STATISTICS, {
      params: { period, month, year },
    });
    return response.data;
  },
  
  clockIn: async (photo, latitude, longitude) => {
    const formData = new FormData();
    
    // Add photo
    if (photo) {
      formData.append('photo', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'attendance.jpg',
      });
    }
    
    // Add GPS data
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    
    const response = await api.post(config.API_ENDPOINTS.CLOCK_IN, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  clockOut: async (photo, latitude, longitude) => {
    const formData = new FormData();
    
    // Add photo
    if (photo) {
      formData.append('photo', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'attendance.jpg',
      });
    }
    
    // Add GPS data
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    
    const response = await api.put(config.API_ENDPOINTS.CLOCK_OUT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Leave Service
export const leaveService = {
  getLeaveRequests: async () => {
    const response = await api.get(config.API_ENDPOINTS.LEAVE_REQUESTS);
    return response.data;
  },
  
  getLeaveBalance: async () => {
    const response = await api.get(config.API_ENDPOINTS.LEAVE_BALANCE);
    return response.data;
  },
  
  createLeaveRequest: async (leaveType, startDate, endDate, reason, attachment) => {
    const formData = new FormData();
    formData.append('leaveType', leaveType);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('reason', reason);
    
    if (attachment) {
      formData.append('attachment', {
        uri: attachment.uri,
        type: attachment.type || 'application/pdf',
        name: attachment.name || 'attachment.pdf',
      });
    }
    
    const response = await api.post(config.API_ENDPOINTS.LEAVE_CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  cancelLeaveRequest: async (id) => {
    const response = await api.delete(config.API_ENDPOINTS.LEAVE_CANCEL(id));
    return response.data;
  },
};

// Overtime Service
export const overtimeService = {
  getOvertimeRequests: async () => {
    const response = await api.get(config.API_ENDPOINTS.OVERTIME_REQUESTS);
    return response.data;
  },
  
  getOvertimeHistory: async () => {
    const response = await api.get(config.API_ENDPOINTS.OVERTIME_HISTORY);
    return response.data;
  },
  
  createOvertimeRequest: async (overtimeDate, requestedHours, reason) => {
    const response = await api.post(config.API_ENDPOINTS.OVERTIME_CREATE, {
      overtimeDate,
      requestedHours: parseFloat(requestedHours),
      reason,
    });
    return response.data;
  },
  
  cancelOvertimeRequest: async (id) => {
    const response = await api.delete(config.API_ENDPOINTS.OVERTIME_CANCEL(id));
    return response.data;
  },
};

// Notification Service
export const notificationService = {
  getNotifications: async (filter = 'all') => {
    const response = await api.get(config.API_ENDPOINTS.NOTIFICATIONS, {
      params: { filter },
    });
    return response.data;
  },
  
  markAsRead: async (id) => {
    const response = await api.patch(config.API_ENDPOINTS.NOTIFICATIONS_MARK_READ(id));
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.post(config.API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
    return response.data;
  },
  
  clearReadNotifications: async () => {
    const response = await api.delete(config.API_ENDPOINTS.NOTIFICATIONS_CLEAR_READ);
    return response.data;
  },
  
  deleteNotification: async (id) => {
    const response = await api.delete(config.API_ENDPOINTS.NOTIFICATIONS_DELETE(id));
    return response.data;
  },
};

// Payroll Service
export const payrollService = {
  getPayslips: async () => {
    const response = await api.get(config.API_ENDPOINTS.PAYROLL_PAYSLIPS);
    return response.data;
  },
  
  getPayslipSummary: async () => {
    const response = await api.get(config.API_ENDPOINTS.PAYROLL_SUMMARY);
    return response.data;
  },
  
  getPayslipDetail: async (payrollId) => {
    const response = await api.get(config.API_ENDPOINTS.PAYROLL_DETAIL(payrollId));
    return response.data;
  },
  
  downloadPayslip: async (payrollId) => {
    const response = await api.get(config.API_ENDPOINTS.PAYROLL_DOWNLOAD(payrollId), {
      responseType: 'blob',
    });
    return response.data;
  },
};
