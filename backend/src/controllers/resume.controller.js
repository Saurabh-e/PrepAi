const resumeService = require('../services/resume.service');
const ApiResponse = require('../utils/api-response');
const { getCurrentUserId } = require('../utils/security.utils');

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error('File parameter is required'));
    }
    const userId = getCurrentUserId(req);
    const resume = await resumeService.uploadResume(userId, req.file);
    return res.status(201).json(ApiResponse.success('Resume uploaded successfully', resume));
  } catch (error) {
    next(error);
  }
};

const getUserResumes = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const resumes = await resumeService.getUserResumes(userId);
    return res.status(200).json(ApiResponse.success(resumes));
  } catch (error) {
    next(error);
  }
};

const getLatestResume = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const resume = await resumeService.getLatestResume(userId);
    return res.status(200).json(ApiResponse.success(resume));
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    await resumeService.deleteResume(userId, req.params.resumeId);
    return res.status(200).json(ApiResponse.success('Resume deleted successfully', null));
  } catch (error) {
    next(error);
  }
};

const downloadReport = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const pdfBytes = await resumeService.generateResumeReportPdf(userId, req.params.resumeId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume-ats-report.pdf"');
    return res.status(200).send(pdfBytes);
  } catch (error) {
    next(error);
  }
};

const matchResumeWithJD = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim() === '') {
      return res.status(400).json(ApiResponse.error('Job description is required'));
    }
    const result = await resumeService.matchResumeWithJD(userId, req.params.resumeId, jobDescription);
    return res.status(200).json(ApiResponse.success('Job description match calculated', result));
  } catch (error) {
    next(error);
  }
};

const downloadMatchReport = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim() === '') {
      return res.status(400).json(ApiResponse.error('Job description is required'));
    }
    const pdfBytes = await resumeService.generateJdMatchReportPdf(userId, req.params.resumeId, jobDescription);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume-job-match-report.pdf"');
    return res.status(200).send(pdfBytes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getUserResumes,
  getLatestResume,
  deleteResume,
  downloadReport,
  matchResumeWithJD,
  downloadMatchReport
};
