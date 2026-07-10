import api from './api';

const notificationService = {
  async getNotifications() {
    const response = await api.get('/api/v1/notifications');
    return response.data.data;
  },

  async getNotificationsPaginated(page = 0, size = 10) {
    const response = await api.get(`/api/v1/notifications/paginated?page=${page}&size=${size}`);
    return response.data.data;
  },

  async getUnreadNotifications() {
    const response = await api.get('/api/v1/notifications/unread');
    return response.data.data;
  },

  async getUnreadCount() {
    const response = await api.get('/api/v1/notifications/unread/count');
    return response.data.data;
  },

  async markAsRead(notificationId) {
    const response = await api.patch(`/api/v1/notifications/${notificationId}/read`);
    return response.data.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/api/v1/notifications/read-all');
    return response.data.data;
  },
};

export default notificationService;
