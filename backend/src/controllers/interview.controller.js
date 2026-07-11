const interviewService = require('../services/interview.service');
const ApiResponse = require('../utils/api-response');
const { getCurrentUserId } = require('../utils/security.utils');

const startInterview = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const result = await interviewService.startInterview(userId, req.body);
    return res.status(201).json(ApiResponse.success('Interview started successfully', result));
  } catch (error) {
    next(error);
  }
};

const getCurrentInterview = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const result = await interviewService.getCurrentInterview(userId);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const getNextQuestion = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { interviewId } = req.query;
    if (!interviewId) {
      return res.status(400).json(ApiResponse.error('Interview ID is required'));
    }
    const result = await interviewService.getNextQuestion(userId, interviewId);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const submitAnswer = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const result = await interviewService.submitAnswer(userId, req.body);
    return res.status(200).json(ApiResponse.success('Answer submitted successfully', result));
  } catch (error) {
    next(error);
  }
};

const endInterview = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    await interviewService.endInterview(userId, req.params.interviewId);
    return res.status(200).json(ApiResponse.success('Interview ended successfully', null));
  } catch (error) {
    next(error);
  }
};

const getInterviewHistory = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const history = await interviewService.getInterviewHistory(userId, page, size);
    return res.status(200).json(ApiResponse.success(history));
  } catch (error) {
    next(error);
  }
};

const getInterviewDetails = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const details = await interviewService.getInterviewDetails(userId, req.params.interviewId);
    return res.status(200).json(ApiResponse.success(details));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  getCurrentInterview,
  getNextQuestion,
  submitAnswer,
  endInterview,
  getInterviewHistory,
  getInterviewDetails
};
