import api from './api';

const userService = {
  async getProfile() {
    const response = await api.get('/api/v1/users/profile');
    return response.data.data;
  },

  async updateProfile(profileData) {
    // profileData: { firstName, lastName, headline, bio }
    const response = await api.put('/api/v1/users/profile', profileData);
    return response.data.data;
  },

  async changePassword(oldPassword, newPassword) {
    const response = await api.post('/api/v1/users/change-password', {
      currentPassword: oldPassword,
      newPassword,
    });
    return response.data;
  },

  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async addSkill(skill) {
    const response = await api.post(`/api/v1/users/skills?skill=${encodeURIComponent(skill)}`);
    return response.data;
  },

  async removeSkill(skill) {
    const response = await api.delete(`/api/v1/users/skills?skill=${encodeURIComponent(skill)}`);
    return response.data;
  },

  // Resumes
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async getUserResumes() {
    const response = await api.get('/api/v1/resumes');
    return response.data.data;
  },

  async getLatestResume() {
    const response = await api.get('/api/v1/resumes/latest');
    return response.data.data;
  },

  async deleteResume(resumeId) {
    const response = await api.delete(`/api/v1/resumes/${resumeId}`);
    return response.data;
  },

  async downloadResumeReport(resumeId) {
    const response = await api.get(`/api/v1/resumes/${resumeId}/download-report`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async matchResumeWithJD(resumeId, jobDescription) {
    const response = await api.post(`/api/v1/resumes/${resumeId}/match-jd`, {
      jobDescription,
    });
    return response.data.data;
  },

  async downloadJdMatchReport(resumeId, jobDescription) {
    const response = await api.post(`/api/v1/resumes/${resumeId}/download-match-report`, {
      jobDescription,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default userService;
