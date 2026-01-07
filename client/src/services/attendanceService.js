import api from '../config/api';

export const attendanceService = {
  // Employee endpoints
  checkIn: async (data) => {
    const formData = new FormData();
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    
    const response = await api.post('/attendances/check-in', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  checkOut: async (data) => {
    const formData = new FormData();
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    
    const response = await api.post('/attendances/check-out', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMyAttendances: async (params) => {
    const response = await api.get('/attendances/my', { params });
    return response.data;
  },

  getAttendanceById: async (id) => {
    const response = await api.get(`/attendances/${id}`);
    return response.data;
  },

  // Admin endpoints
  getAllAttendances: async (params) => {
    const response = await api.get('/admin/attendances', { params });
    return response.data;
  },

  updateAttendance: async (id, data) => {
    const response = await api.put(`/admin/attendances/${id}`, data);
    return response.data;
  },

  deleteAttendance: async (id) => {
    const response = await api.delete(`/admin/attendances/${id}`);
    return response.data;
  },
};
