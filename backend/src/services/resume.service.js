const Resume = require('../models/resume.model');
const fileStorageService = require('./file-storage.service');
const cloudinaryService = require('./cloudinary.service');
const groqAIService = require('./groq-ai.service');
const pdfReportService = require('./pdf-report.service');
const notificationService = require('./notification.service');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const modelMapper = require('../utils/model-mapper');

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const PROGRAMMING_SKILLS = new Set([
  "java", "python", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust", "kotlin",
  "spring", "spring boot", "react", "angular", "vue", "node.js", "express", "django", "flask",
  "mongodb", "mysql", "postgresql", "redis", "elasticsearch", "aws", "azure", "docker", "kubernetes",
  "git", "jenkins", "ci/cd", "agile", "scrum", "rest api", "graphql", "microservices",
  "html", "css", "sass", "webpack", "junit", "mockito", "selenium", "jira"
]);

const uploadResume = async (userId, file) => {
  console.log(`Uploading resume for user: ${userId}`);

  validateFile(file);

  try {
    // Extract text from resume
    const extractedText = await extractText(file);

    // Upload using Cloudinary if configured; fallback to local storage
    let fileUrl;
    let filePath;
    let cloudinaryPublicId = null;

    if (cloudinaryService.isConfigured()) {
      try {
        const uploadResult = await cloudinaryService.uploadFile(file, 'resumes');
        fileUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
        filePath = cloudinaryPublicId;
        console.log(`Resume uploaded to Cloudinary. Public ID: ${cloudinaryPublicId}`);
      } catch (e) {
        console.error('Cloudinary upload failed, falling back to local file storage:', e);
        filePath = await fileStorageService.storeFile(file, 'resumes');
        const fileName = extractFileName(filePath);
        fileUrl = `/api/v1/files/resumes/${fileName}`;
      }
    } else {
      console.log('Cloudinary not configured. Storing resume locally.');
      filePath = await fileStorageService.storeFile(file, 'resumes');
      const fileName = extractFileName(filePath);
      fileUrl = `/api/v1/files/resumes/${fileName}`;
    }

    // Parse skills
    const parsedSkills = parseSkills(extractedText);

    // Parse contact & structural sections
    const parsedData = parseResumeData(extractedText);

    // Run Groq AI ATS Score and Analysis
    const analysis = await groqAIService.analyzeResume(extractedText);

    // Save resume document
    const resume = new Resume({
      userId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      fileUrl,
      filePath,
      cloudinaryPublicId,
      extractedText,
      parsedSkills,
      parsedData,
      analysis
    });

    await resume.save();
    console.log(`Resume uploaded successfully with ID: ${resume._id}`);

    // Create notification
    await notificationService.createNotification(
      userId,
      'RESUME_UPLOADED',
      'Resume Uploaded',
      'Your resume has been uploaded and processed successfully'
    );

    return modelMapper.toResumeDTO(resume);
  } catch (error) {
    console.error('Error processing resume:', error);
    throw new BadRequestError(`Failed to process resume: ${error.message}`);
  }
};

const getUserResumes = async (userId) => {
  console.log(`Getting resumes for user: ${userId}`);
  const resumes = await Resume.find({ userId });
  return resumes.map(modelMapper.toResumeDTO);
};

const getLatestResume = async (userId) => {
  console.log(`Getting latest resume for user: ${userId}`);
  const resume = await Resume.findOne({ userId }).sort({ uploadedAt: -1 });
  if (!resume) {
    throw new NotFoundError('No resume found for user');
  }
  return modelMapper.toResumeDTO(resume);
};

const deleteResume = async (userId, resumeId) => {
  console.log(`Deleting resume: ${resumeId}`);
  
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new NotFoundError('Resume not found');
  }

  if (resume.userId !== userId) {
    throw new BadRequestError('Unauthorized access to resume');
  }

  // Delete from file storage
  if (resume.cloudinaryPublicId) {
    await cloudinaryService.deleteFile(resume.cloudinaryPublicId);
  } else {
    await fileStorageService.deleteFile(resume.filePath);
  }

  await Resume.deleteOne({ _id: resumeId });
  console.log('Resume deleted successfully');
};

const generateResumeReportPdf = async (userId, resumeId) => {
  console.log(`Retrieving resume report for id: ${resumeId}`);
  
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new NotFoundError('Resume not found');
  }

  if (resume.userId !== userId) {
    throw new BadRequestError('Unauthorized access to resume report');
  }

  // If analysis is missing, generate and save it
  if (!resume.analysis) {
    console.log('Analysis details missing, generating now...');
    const analysis = await groqAIService.analyzeResume(resume.extractedText);
    resume.analysis = analysis;
    await resume.save();
  }

  try {
    return await pdfReportService.generateResumeReport(resume);
  } catch (error) {
    console.error('Failed to generate PDF report:', error);
    throw new BadRequestError(`Failed to generate PDF report: ${error.message}`);
  }
};

const matchResumeWithJD = async (userId, resumeId, jobDescription) => {
  console.log(`Matching resume ${resumeId} with target Job Description`);
  
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new NotFoundError('Resume not found');
  }

  if (resume.userId !== userId) {
    throw new BadRequestError('Unauthorized access to resume');
  }

  return await groqAIService.matchResumeWithJD(resume.extractedText, jobDescription);
};

const generateJdMatchReportPdf = async (userId, resumeId, jobDescription) => {
  console.log(`Generating Job Match PDF report for resume: ${resumeId}`);
  
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new NotFoundError('Resume not found');
  }

  if (resume.userId !== userId) {
    throw new BadRequestError('Unauthorized access to resume');
  }

  // Run AI match comparison
  const matchResult = await groqAIService.matchResumeWithJD(resume.extractedText, jobDescription);

  // Generate PDF report bytes
  try {
    return await pdfReportService.generateJdMatchReport(resume, jobDescription, matchResult);
  } catch (error) {
    console.error('Failed to generate JD match PDF report:', error);
    throw new BadRequestError(`Failed to generate PDF report: ${error.message}`);
  }
};

// Helpers
const validateFile = (file) => {
  if (!file || !file.buffer || file.size === 0) {
    throw new BadRequestError('File is empty');
  }

  const contentType = file.mimetype;
  const isPdf = contentType === 'application/pdf';
  const isDocx = contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (!isPdf && !isDocx) {
    throw new BadRequestError('Only PDF and DOCX files are allowed');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new BadRequestError('File size exceeds 10MB limit');
  }
};

const extractText = async (file) => {
  const contentType = file.mimetype;
  if (contentType === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  } else if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const data = await mammoth.extractRawText({ buffer: file.buffer });
    return data.value;
  }
  throw new BadRequestError('Unsupported file type');
};

const parseSkills = (text) => {
  const foundSkills = new Set();
  const lowerText = text.toLowerCase();

  for (const skill of PROGRAMMING_SKILLS) {
    // Escape special characters in skill name for regex matching (like c++)
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b|${escaped}`, 'g');
    if (regex.test(lowerText)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
};

const parseResumeData = (text) => {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    education: extractSection(text, 'education'),
    experience: extractSection(text, 'experience'),
    certifications: extractSection(text, 'certification')
  };
};

const extractName = (text) => {
  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (line && line.length < 50) {
      return line;
    }
  }
  return 'Not found';
};

const extractEmail = (text) => {
  const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(pattern);
  return match ? match[0] : 'Not found';
};

const extractPhone = (text) => {
  const pattern = /\+?\d[\d\s-]{8,}\d/;
  const match = text.match(pattern);
  return match ? match[0] : 'Not found';
};

const extractSection = (text, sectionName) => {
  const items = [];
  const lowerText = text.toLowerCase();
  
  const startIndex = lowerText.indexOf(sectionName);
  if (startIndex === -1) {
    return items;
  }

  const commonSections = ["education", "experience", "skills", "projects", "certification"];
  let endIndex = text.length;
  for (const section of commonSections) {
    if (section !== sectionName) {
      const sectionIndex = lowerText.indexOf(section, startIndex + sectionName.length);
      if (sectionIndex !== -1 && sectionIndex < endIndex) {
        endIndex = sectionIndex;
      }
    }
  }

  const sectionText = text.substring(startIndex, endIndex);
  const lines = sectionText.split('\n');
  
  for (let line of lines) {
    line = line.trim();
    if (line && !line.toLowerCase().includes(sectionName)) {
      items.push(line);
    }
  }

  return items;
};

const extractFileName = (filePath) => {
  if (!filePath) return '';
  const parts = filePath.split('/');
  return parts[parts.length - 1];
};

module.exports = {
  uploadResume,
  getUserResumes,
  getLatestResume,
  deleteResume,
  generateResumeReportPdf,
  matchResumeWithJD,
  generateJdMatchReportPdf
};
