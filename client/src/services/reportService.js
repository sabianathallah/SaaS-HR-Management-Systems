import api from '../config/api';

export const reportService = {
  getAttendanceReport: async (params) => {
    const response = await api.get('/admin/reports/attendance', { params });
    return response.data;
  },

  exportAttendanceReport: async (params) => {
    const response = await api.get('/admin/reports/export/attendance', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  getLeaveReport: async (params) => {
    const response = await api.get('/admin/reports/leave', { params });
    return response.data;
  },

  getOvertimeReport: async (params) => {
    const response = await api.get('/admin/reports/overtime', { params });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/reports/dashboard');
    return response.data;
  },
};
