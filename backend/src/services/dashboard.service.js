const Interview = require('../models/interview.model');
const Progress = require('../models/progress.model');
const modelMapper = require('../utils/model-mapper');

const getDashboard = async (userId) => {
  console.log(`Getting dashboard for user: ${userId}`);

  const progress = await Progress.findOne({ userId }) || {
    userId,
    totalInterviews: 0,
    averageScore: 0.0,
    highestScore: 0.0,
    domainProgress: new Map(),
    skillAnalytics: new Map()
  };

  // Get recent 5 completed/in-progress interviews
  const recentInterviewsList = await Interview.find({ userId })
    .sort({ startedAt: -1 })
    .limit(5);

  const recentInterviews = recentInterviewsList.map(modelMapper.toInterviewDTO);

  // Calculate performance trend (last 30 days)
  const performanceTrend = await calculatePerformanceTrend(userId);

  // Identify weak and strong topics
  const weakTopics = identifyWeakTopics(progress);
  const strongTopics = identifyStrongTopics(progress);

  // Convert skill analytics
  const skillAnalytics = convertSkillAnalytics(progress);

  return {
    totalInterviews: progress.totalInterviews,
    averageScore: progress.averageScore,
    highestScore: progress.highestScore,
    recentInterviews,
    performanceTrend,
    weakTopics,
    strongTopics,
    skillAnalytics
  };
};

const calculatePerformanceTrend = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentInterviews = await Interview.find({
    userId,
    status: 'COMPLETED',
    startedAt: { $gte: thirtyDaysAgo }
  });

  const scoresByWeek = {};
  for (const interview of recentInterviews) {
    if (interview.overallScore !== undefined && interview.overallScore !== null) {
      const weekKey = getWeekKey(new Date(interview.startedAt));
      if (!scoresByWeek[weekKey]) {
        scoresByWeek[weekKey] = [];
      }
      scoresByWeek[weekKey].push(interview.overallScore);
    }
  }

  const trend = {};
  for (const [weekKey, scores] of Object.entries(scoresByWeek)) {
    const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    trend[weekKey] = avg;
  }

  return trend;
};

const identifyWeakTopics = (progress) => {
  const weak = [];
  if (!progress.domainProgress) return weak;

  for (const [topic, data] of progress.domainProgress.entries()) {
    if (data.averageScore < 6.0) {
      weak.push({
        topic,
        averageScore: data.averageScore,
        timesAssessed: data.interviewsCompleted
      });
    }
  }

  return weak
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5);
};

const identifyStrongTopics = (progress) => {
  const strong = [];
  if (!progress.domainProgress) return strong;

  for (const [topic, data] of progress.domainProgress.entries()) {
    if (data.averageScore >= 7.0) {
      strong.push({
        topic,
        averageScore: data.averageScore,
        timesAssessed: data.interviewsCompleted
      });
    }
  }

  return strong
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);
};

const convertSkillAnalytics = (progress) => {
  const analytics = {};
  if (!progress.skillAnalytics) return analytics;

  for (const [skill, data] of progress.skillAnalytics.entries()) {
    analytics[skill] = {
      score: data.averageScore,
      strength: data.strength
    };
  }

  return analytics;
};

const getWeekKey = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const weekOfYear = Math.floor(dayOfYear / 7);
  return `Week ${weekOfYear}`;
};

module.exports = {
  getDashboard
};
