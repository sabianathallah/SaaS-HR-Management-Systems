import api from '../config/api';

export const overtimeService = {
  // Employee endpoints
  createOvertimeRequest: async (data) => {
    const response = await api.post('/overtime', data);
    return response.data;
  },

  getMyOvertimeRequests: async (params) => {
    const response = await api.get('/overtime/my', { params });
    return response.data;
  },

  // Admin endpoints
  getAllOvertimeRequests: async (params) => {
    const response = await api.get('/admin/overtime', { params });
    return response.data;
  },

  approveOvertimeRequest: async (id, data) => {
    const response = await api.patch(`/admin/overtime/${id}/approve`, data);
    return response.data;
  },

  rejectOvertimeRequest: async (id, data) => {
    const response = await api.patch(`/admin/overtime/${id}/reject`, data);
    return response.data;
  },
};
