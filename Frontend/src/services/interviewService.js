import api from './api';

const interviewService = {
  async startInterview(jobRole, domain, difficulty, numberOfQuestions) {
    const response = await api.post('/api/v1/interviews/start', {
      jobRole,
      domain,
      difficulty,
      numberOfQuestions,
    });
    return response.data.data;
  },

  async getCurrentInterview() {
    const response = await api.get('/api/v1/interviews/current');
    return response.data.data;
  },

  async getNextQuestion(interviewId) {
    const response = await api.get(`/api/v1/interviews/next-question?interviewId=${interviewId}`);
    return response.data.data;
  },

  async submitAnswer(interviewId, questionId, answerText, timeTakenSeconds) {
    const response = await api.post('/api/v1/interviews/submit-answer', {
      interviewId,
      questionId,
      answerText,
      timeTakenSeconds,
    });
    return response.data.data;
  },

  async endInterview(interviewId) {
    const response = await api.post(`/api/v1/interviews/${interviewId}/end`);
    return response.data.data;
  },

  async getInterviewHistory(page = 0, size = 10) {
    const response = await api.get(`/api/v1/interviews/history?page=${page}&size=${size}`);
    return response.data.data;
  },

  async getInterviewDetails(interviewId) {
    const response = await api.get(`/api/v1/interviews/${interviewId}`);
    return response.data.data;
  },

  // Dashboard Summary endpoint (connects to DashboardController)
  async getDashboardSummary() {
    const response = await api.get('/api/v1/dashboard');
    return response.data.data;
  },
  // Compile and Run C++ code
  async compileAndRun(sourceCode, input) {
    const response = await api.post('/api/v1/compiler/run', {
      sourceCode,
      input,
    });
    return response.data.data;
  },
};

export default interviewService;
