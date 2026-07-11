const Interview = require('../models/interview.model');
const Question = require('../models/question.model');
const Answer = require('../models/answer.model');
const Feedback = require('../models/feedback.model');
const Progress = require('../models/progress.model');
const groqAIService = require('./groq-ai.service');
const notificationService = require('./notification.service');
const codeforcesService = require('./codeforces.service');
const cppCompilerService = require('./cpp-compiler.service');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const modelMapper = require('../utils/model-mapper');

const startInterview = async (userId, request) => {
  console.log(`Starting interview for user: ${userId}`);

  // Check for existing in-progress interview
  const existingInterview = await Interview.findOne({
    userId,
    status: 'IN_PROGRESS'
  }).sort({ startedAt: -1 });

  if (existingInterview) {
    if (!existingInterview.questionIds || existingInterview.questionIds.length === 0) {
      console.warn(`Found stuck in-progress interview with no questions, deleting: ${existingInterview._id}`);
      await Interview.deleteOne({ _id: existingInterview._id });
    } else {
      throw new BadRequestError('You already have an interview in progress. Please complete or end it first.');
    }
  }

  // Create interview
  const interview = new Interview({
    userId,
    jobRole: request.jobRole,
    domain: request.domain,
    difficulty: request.difficulty,
    totalQuestions: request.numberOfQuestions,
    completedQuestions: 0,
    status: 'IN_PROGRESS',
    aiModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    questionIds: []
  });

  await interview.save();
  console.log(`Interview created with ID: ${interview._id}`);

  // Generate first question
  try {
    await generateNextQuestion(interview);
  } catch (error) {
    console.error('Failed to generate first question for interview, deleting interview record:', error);
    await Interview.deleteOne({ _id: interview._id });
    throw error;
  }

  return modelMapper.toInterviewDTO(interview);
};

const submitAnswer = async (userId, request) => {
  console.log(`Submitting answer for question: ${request.questionId}`);

  const question = await Question.findById(request.questionId);
  if (!question) {
    throw new NotFoundError('Question not found');
  }

  const interview = await Interview.findById(question.interviewId);
  if (!interview) {
    throw new NotFoundError('Interview not found');
  }

  if (interview.userId !== userId) {
    throw new BadRequestError('Unauthorized access to interview');
  }

  const alreadySubmitted = await Answer.findOne({ questionId: question._id.toString() });
  if (alreadySubmitted) {
    throw new BadRequestError('Answer already submitted for this question');
  }

  // Evaluate answer using AI or compiler
  let evaluation;
  if (interview.domain === 'CODEFORCES') {
    const cppCode = request.answerText;
    const testJson = question.sampleTestsJson;
    let totalTests = 0;
    let passedTests = 0;
    let runSummary = '';

    try {
      if (testJson) {
        const tests = JSON.parse(testJson);
        totalTests = tests.length;
        for (let i = 0; i < totalTests; i++) {
          const test = tests[i];
          const input = test.input;
          const expectedOutput = test.output.trim();

          const runRes = await cppCompilerService.compileAndRun(cppCode, input);
          if (!runRes.compiled) {
            runSummary += `Compilation Error: ${runRes.compilerMessage}\n`;
            break;
          }

          if (runRes.timeout) {
            runSummary += `Test Case ${i + 1}: Time Limit Exceeded\n`;
          } else if (runRes.exitCode !== 0) {
            runSummary += `Test Case ${i + 1}: Runtime Error (Exit Code ${runRes.exitCode})\nStderr:\n${runRes.stderr}\n`;
          } else {
            const actual = runRes.stdout.trim();
            // Normalize carriage return endings
            const cleanExpected = expectedOutput.replace(/\r\n/g, '\n');
            const cleanActual = actual.replace(/\r\n/g, '\n');
            const passed = cleanExpected === cleanActual;
            
            if (passed) {
              passedTests++;
              runSummary += `Test Case ${i + 1}: Passed (${runRes.timeMs} ms)\n`;
            } else {
              runSummary += `Test Case ${i + 1}: Failed\nInput:\n${input}\nExpected:\n${expectedOutput}\nGot:\n${actual}\n`;
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed executing test cases for submission:', e);
      runSummary += 'Failed running test cases due to system parsing error.';
    }

    if (!runSummary) {
      runSummary = 'No sample test cases provided.';
    }

    evaluation = await groqAIService.evaluateCodingAnswer(
      question.problemTitle,
      question.problemDescription,
      cppCode,
      `Ran ${totalTests} test cases. Passed: ${passedTests}\nSummary:\n${runSummary}`,
      interview.difficulty
    );
  } else {
    evaluation = await groqAIService.evaluateAnswer(
      question.questionText,
      request.answerText,
      interview.domain,
      interview.difficulty
    );
  }

  // Save answer
  const answer = new Answer({
    questionId: question._id.toString(),
    interviewId: interview._id.toString(),
    userId,
    answerText: request.answerText,
    score: evaluation.score,
    technicalFeedback: evaluation.technicalFeedback,
    communicationFeedback: evaluation.communicationFeedback,
    improvements: evaluation.improvements,
    aiResponse: evaluation.aiResponse
  });

  await answer.save();
  console.log(`Answer saved with score: ${answer.score}`);

  // Update interview progress
  interview.completedQuestions += 1;
  await interview.save();

  // Generate next question if not completed
  if (interview.completedQuestions < interview.totalQuestions) {
    await generateNextQuestion(interview);
  } else {
    await completeInterview(interview);
  }

  return modelMapper.toAnswerDTO(answer);
};

const getNextQuestion = async (userId, interviewId) => {
  console.log(`Getting next question for interview: ${interviewId}`);

  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new NotFoundError('Interview not found');
  }

  if (interview.userId !== userId) {
    throw new BadRequestError('Unauthorized access to interview');
  }

  const questions = await Question.find({ interviewId }).sort({ questionNumber: 1 });
  const answers = await Answer.find({ interviewId });

  if (questions.length > answers.length) {
    const nextQuestion = questions[answers.length];
    return modelMapper.toQuestionDTO(nextQuestion);
  }

  throw new NotFoundError('No more questions available');
};

const getCurrentInterview = async (userId) => {
  console.log(`Getting current interview for user: ${userId}`);

  const interview = await Interview.findOne({
    userId,
    status: 'IN_PROGRESS'
  }).sort({ startedAt: -1 });

  if (!interview) {
    throw new NotFoundError('No active interview found');
  }

  return modelMapper.toInterviewDTO(interview);
};

const endInterview = async (userId, interviewId) => {
  console.log(`Ending interview: ${interviewId}`);

  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new NotFoundError('Interview not found');
  }

  if (interview.userId !== userId) {
    throw new BadRequestError('Unauthorized access to interview');
  }

  await completeInterview(interview);
};

const getInterviewHistory = async (userId, page = 0, size = 10) => {
  console.log(`Getting interview history for user: ${userId}`);
  
  const totalElements = await Interview.countDocuments({ userId });
  const content = await Interview.find({ userId })
    .sort({ startedAt: -1 })
    .skip(page * size)
    .limit(size);
    
  const totalPages = Math.ceil(totalElements / size);

  // Map to InterviewDTO
  const mappedContent = content.map(modelMapper.toInterviewDTO);
  
  return {
    content: mappedContent,
    pageable: {
      pageNumber: page,
      pageSize: size
    },
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
    first: page === 0,
    size,
    number: page,
    numberOfElements: mappedContent.length,
    empty: mappedContent.length === 0
  };
};

const getInterviewDetails = async (userId, interviewId) => {
  console.log(`Getting interview details: ${interviewId}`);

  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new NotFoundError('Interview not found');
  }

  if (interview.userId !== userId) {
    throw new BadRequestError('Unauthorized access to interview');
  }

  const questions = await Question.find({ interviewId }).sort({ questionNumber: 1 });
  const answers = await Answer.find({ interviewId });
  const feedback = await Feedback.findOne({ interviewId });

  return {
    interview: modelMapper.toInterviewDTO(interview),
    questions: questions.map(modelMapper.toQuestionDTO),
    answers: answers.map(modelMapper.toAnswerDTO),
    feedback: feedback || null
  };
};

const generateNextQuestion = async (interview) => {
  console.log(`Generating next question for interview: ${interview._id}`);

  const nextQuestionNumber = interview.completedQuestions + 1;
  let questionData;

  if (interview.domain === 'CODEFORCES') {
    const qData = await codeforcesService.generateCodeforcesQuestion(
      interview._id.toString(),
      interview.userId,
      nextQuestionNumber,
      interview.difficulty
    );
    
    questionData = new Question(qData);
  } else {
    const questions = await groqAIService.generateInterviewQuestions(
      interview.jobRole,
      interview.domain,
      interview.difficulty,
      1
    );

    if (questions.length === 0) {
      throw new BadRequestError('Failed to generate question');
    }

    questionData = new Question({
      interviewId: interview._id.toString(),
      userId: interview.userId,
      questionNumber: nextQuestionNumber,
      questionText: questions[0],
      questionType: 'TECHNICAL',
      difficulty: interview.difficulty
    });
  }

  const savedQuestion = await questionData.save();
  interview.questionIds.push(savedQuestion._id.toString());
  await interview.save();

  console.log(`Question ${nextQuestionNumber} generated successfully`);
};

const completeInterview = async (interview) => {
  console.log(`Completing interview: ${interview._id}`);

  // Fetch updated document to avoid concurrency race conditions
  const updatedInterview = await Interview.findById(interview._id);
  if (updatedInterview.status === 'COMPLETED') {
    console.log(`Interview ${interview._id} is already completed. Skipping.`);
    return;
  }

  updatedInterview.status = 'COMPLETED';
  updatedInterview.completedAt = new Date();
  
  // Calculate duration in minutes
  const started = new Date(updatedInterview.startedAt).getTime();
  const completed = updatedInterview.completedAt.getTime();
  updatedInterview.durationMinutes = Math.max(1, Math.round((completed - started) / 60000));

  const questions = await Question.find({ interviewId: updatedInterview._id.toString() }).sort({ questionNumber: 1 });
  const answers = await Answer.find({ interviewId: updatedInterview._id.toString() });

  const qaList = [];
  for (let i = 0; i < questions.length && i < answers.length; i++) {
    qaList.push({
      question: questions[i].questionText,
      answer: answers[i].answerText,
      score: answers[i].score
    });
  }

  const summary = await groqAIService.generateInterviewSummary(qaList, updatedInterview.domain);

  // Calculate average score
  let avgScore = 0.0;
  if (answers.length > 0) {
    const totalScore = answers.reduce((sum, current) => sum + current.score, 0);
    avgScore = totalScore / answers.length;
  }

  updatedInterview.overallScore = avgScore;
  await updatedInterview.save();

  // Save detailed feedback
  await saveFeedback(updatedInterview, summary, answers);

  // Update progress stats
  await updateProgress(updatedInterview.userId, updatedInterview, avgScore);

  // Send completed notification
  await notificationService.createNotification(
    updatedInterview.userId,
    'INTERVIEW_COMPLETED',
    'Interview Completed',
    `Your interview for ${updatedInterview.jobRole} has been completed with a score of ${avgScore.toFixed(1)}/10`
  );

  console.log(`Interview completed successfully with average score: ${avgScore}`);
};

const saveFeedback = async (interview, summary, answers) => {
  let feedback = await Feedback.findOne({ interviewId: interview._id.toString() });
  
  if (!feedback) {
    feedback = new Feedback({
      interviewId: interview._id.toString(),
      userId: interview.userId
    });
  }

  feedback.overallScore = summary.overallScore || 0;
  feedback.overallSummary = 'Interview completed successfully';
  feedback.strengths = summary.strengths || [];
  feedback.weaknesses = summary.weaknesses || [];
  feedback.recommendations = summary.recommendations || [];
  
  // Format learning resources to schema
  if (summary.learningResources && Array.isArray(summary.learningResources)) {
    feedback.learningResources = summary.learningResources.map(res => {
      const parts = res.split(':');
      const topic = parts[0] ? parts[0].trim() : 'Topic';
      const description = parts[1] ? parts[1].trim() : 'Review details';
      return {
        topic,
        description,
        resourceUrl: `https://www.google.com/search?q=${encodeURIComponent(topic)}`
      };
    });
  }

  await feedback.save();
};

const updateProgress = async (userId, interview, score) => {
  let progress = await Progress.findOne({ userId });
  
  if (!progress) {
    progress = new Progress({
      userId,
      totalInterviews: 0,
      averageScore: 0.0,
      highestScore: 0.0,
      domainProgress: new Map(),
      skillAnalytics: new Map()
    });
  }

  progress.totalInterviews += 1;
  
  // Recalculate global average
  const newAvg = ((progress.averageScore * (progress.totalInterviews - 1)) + score) / progress.totalInterviews;
  progress.averageScore = newAvg;

  if (score > progress.highestScore) {
    progress.highestScore = score;
  }

  // Update domain progress
  const domain = interview.domain;
  let dProgress = progress.domainProgress.get(domain);
  if (!dProgress) {
    dProgress = { interviewsCompleted: 0, averageScore: 0.0 };
  }

  const dInterviews = dProgress.interviewsCompleted + 1;
  const dAvg = ((dProgress.averageScore * dProgress.interviewsCompleted) + score) / dInterviews;

  dProgress.interviewsCompleted = dInterviews;
  dProgress.averageScore = dAvg;
  dProgress.lastDifficulty = interview.difficulty;

  progress.domainProgress.set(domain, dProgress);

  await progress.save();
  console.log(`Progress updated for user: ${userId}`);
};

module.exports = {
  startInterview,
  submitAnswer,
  getNextQuestion,
  getCurrentInterview,
  endInterview,
  getInterviewHistory,
  getInterviewDetails
};
