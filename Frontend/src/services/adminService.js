import api from './api';

const adminService = {
  async getAllUsers(page = 0, size = 10) {
    const response = await api.get(`/api/v1/admin/users?page=${page}&size=${size}`);
    return response.data.data;
  },

  async searchUsers(email, page = 0, size = 10) {
    const response = await api.get(`/api/v1/admin/users/search?email=${encodeURIComponent(email)}&page=${page}&size=${size}`);
    return response.data.data;
  },

  async getUserById(userId) {
    const response = await api.get(`/api/v1/admin/users/${userId}`);
    return response.data.data;
  },

  async suspendUser(userId) {
    const response = await api.patch(`/api/v1/admin/users/${userId}/suspend`);
    return response.data.data;
  },

  async activateUser(userId) {
    const response = await api.patch(`/api/v1/admin/users/${userId}/activate`);
    return response.data.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/api/v1/admin/users/${userId}`);
    return response.data.data;
  },

  async getPlatformAnalytics() {
    const response = await api.get('/api/v1/admin/analytics');
    return response.data.data;
  },

  async getAIUsageStatistics() {
    const response = await api.get('/api/v1/admin/ai-usage');
    return response.data.data;
  },
};

export default adminService;
