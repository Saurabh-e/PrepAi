import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/api/v1/auth/login', { email, password });
    // response.data shape is ApiResponse<AuthResponse>
    // AuthResponse typically contains accessToken, refreshToken, user (or we fetch user profile separately)
    const { data } = response.data;
    if (data && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    }
    return data;
  },

  async register(firstName, lastName, email, password) {
    const response = await api.post('/api/v1/auth/register', {
      firstName,
      lastName,
      email,
      password,
    });
    const { data } = response.data;
    if (data && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    }
    return data;
  },

  async logout() {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (e) {
      console.error('Logout error on backend:', e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  getCurrentUserToken() {
    return localStorage.getItem('accessToken');
  },
};

export default authService;
