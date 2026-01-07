import api from '../config/api';

export const leaveService = {
  // Employee endpoints
  createLeaveRequest: async (data) => {
    const response = await api.post('/leave-requests', data);
    return response.data;
  },

  getMyLeaveRequests: async (params) => {
    const response = await api.get('/leave-requests/my', { params });
    return response.data;
  },

  cancelLeaveRequest: async (id) => {
    const response = await api.patch(`/leave-requests/${id}/cancel`);
    return response.data;
  },

  // Admin endpoints
  getAllLeaveRequests: async (params) => {
    const response = await api.get('/admin/leave-requests', { params });
    return response.data;
  },

  approveLeaveRequest: async (id, data) => {
    const response = await api.patch(`/admin/leave-requests/${id}/approve`, data);
    return response.data;
  },

  rejectLeaveRequest: async (id, data) => {
    const response = await api.patch(`/admin/leave-requests/${id}/reject`, data);
    return response.data;
  },
};
