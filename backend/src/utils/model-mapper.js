const toUserProfileDTO = (user) => {
  if (!user) return null;
  return {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || null,
    profileImageUrl: user.profileImageUrl || null,
    roles: user.roles || [],
    skills: user.skills || [],
    experience: user.experience || null,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || null
  };
};

const toUserDTO = (user) => {
  if (!user) return null;
  return {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles || []
  };
};

const toInterviewDTO = (interview) => {
  if (!interview) return null;
  return {
    id: interview._id ? interview._id.toString() : interview.id,
    jobRole: interview.jobRole,
    domain: interview.domain,
    difficulty: interview.difficulty,
    totalQuestions: interview.totalQuestions,
    completedQuestions: interview.completedQuestions,
    status: interview.status,
    overallScore: interview.overallScore !== undefined ? interview.overallScore : null,
    startedAt: interview.startedAt,
    completedAt: interview.completedAt || null,
    durationMinutes: interview.durationMinutes !== undefined ? interview.durationMinutes : null
  };
};

const toQuestionDTO = (question) => {
  if (!question) return null;
  return {
    id: question._id ? question._id.toString() : question.id,
    questionNumber: question.questionNumber,
    questionText: question.questionText,
    questionType: question.questionType || null,
    difficulty: question.difficulty || null,
    askedAt: question.askedAt,
    isCodingProblem: question.isCodingProblem || null,
    problemTitle: question.problemTitle || null,
    problemDescription: question.problemDescription || null,
    inputSpecification: question.inputSpecification || null,
    outputSpecification: question.outputSpecification || null,
    sampleTestsJson: question.sampleTestsJson || null,
    timeLimit: question.timeLimit || null,
    memoryLimit: question.memoryLimit || null,
    note: question.note || null
  };
};

const toAnswerDTO = (answer) => {
  if (!answer) return null;
  return {
    id: answer._id ? answer._id.toString() : answer.id,
    questionId: answer.questionId,
    answerText: answer.answerText,
    score: answer.score,
    technicalFeedback: answer.technicalFeedback || null,
    communicationFeedback: answer.communicationFeedback || null,
    improvements: answer.improvements || null,
    answeredAt: answer.answeredAt,
    responseTimeSeconds: answer.responseTimeSeconds !== undefined ? answer.responseTimeSeconds : null
  };
};

const toResumeDTO = (resume) => {
  if (!resume) return null;
  return {
    id: resume._id ? resume._id.toString() : resume.id,
    fileName: resume.fileName || null,
    fileType: resume.fileType || null,
    fileSize: resume.fileSize || null,
    fileUrl: resume.fileUrl || null,
    parsedSkills: resume.parsedSkills || [],
    analysis: resume.analysis || null,
    uploadedAt: resume.uploadedAt
  };
};

module.exports = {
  toUserProfileDTO,
  toUserDTO,
  toInterviewDTO,
  toQuestionDTO,
  toAnswerDTO,
  toResumeDTO
};
