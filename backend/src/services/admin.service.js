const User = require('../models/user.model');
const Interview = require('../models/interview.model');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const modelMapper = require('../utils/model-mapper');

const getAllUsers = async (page = 0, size = 10) => {
  console.log('Getting all users paginated');
  
  const totalElements = await User.countDocuments();
  const users = await User.find()
    .skip(page * size)
    .limit(size);
    
  const totalPages = Math.ceil(totalElements / size);
  const content = users.map(modelMapper.toUserProfileDTO);
  
  return {
    content,
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
    numberOfElements: content.length,
    empty: content.length === 0
  };
};

const searchUsers = async (email, page = 0, size = 10) => {
  console.log(`Searching users by email: ${email}`);
  
  const query = { email: { $regex: email, $options: 'i' } };
  const totalElements = await User.countDocuments(query);
  const users = await User.find(query)
    .skip(page * size)
    .limit(size);
    
  const totalPages = Math.ceil(totalElements / size);
  const content = users.map(modelMapper.toUserProfileDTO);
  
  return {
    content,
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
    numberOfElements: content.length,
    empty: content.length === 0
  };
};

const getUserById = async (userId) => {
  console.log(`Getting user by ID: ${userId}`);
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return modelMapper.toUserProfileDTO(user);
};

const suspendUser = async (userId) => {
  console.log(`Suspending user: ${userId}`);
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.roles.includes('ADMIN')) {
    throw new BadRequestError('Cannot suspend admin users');
  }

  user.status = 'SUSPENDED';
  await user.save();
  console.log('User suspended successfully');
};

const activateUser = async (userId) => {
  console.log(`Activating user: ${userId}`);
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  user.status = 'ACTIVE';
  await user.save();
  console.log('User activated successfully');
};

const deleteUser = async (userId) => {
  console.log(`Deleting user: ${userId}`);
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.roles.includes('ADMIN')) {
    throw new BadRequestError('Cannot delete admin users');
  }

  user.status = 'DELETED';
  await user.save();
  console.log('User deleted successfully');
};

const getPlatformAnalytics = async () => {
  console.log('Getting platform analytics');

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'ACTIVE' });
  const suspendedUsers = await User.countDocuments({ status: 'SUSPENDED' });

  const interviews = await Interview.find();
  const totalInterviews = interviews.length;
  
  const completedInterviews = interviews.filter(i => i.status === 'COMPLETED').length;
  const inProgressInterviews = interviews.filter(i => i.status === 'IN_PROGRESS').length;

  const completedWithScore = interviews.filter(i => i.status === 'COMPLETED' && i.overallScore !== undefined && i.overallScore !== null);
  const avgScore = completedWithScore.length > 0
    ? completedWithScore.reduce((sum, i) => sum + i.overallScore, 0) / completedWithScore.length
    : 0.0;

  // Domain distribution
  const domains = ['JAVA', 'SPRING_BOOT', 'MERN', 'DSA', 'HR', 'SQL', 'JAVASCRIPT', 'CODEFORCES'];
  const domainDistribution = {};
  domains.forEach(domain => {
    domainDistribution[domain] = interviews.filter(i => i.domain === domain).length;
  });

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalInterviews,
    completedInterviews,
    inProgressInterviews,
    platformAverageScore: avgScore,
    domainDistribution
  };
};

const getAIUsageStatistics = async () => {
  console.log('Getting AI usage statistics');

  const totalInterviews = await Interview.countDocuments();
  const estimatedApiCalls = totalInterviews * 10; // Assuming avg 10 API calls per interview

  const interviews = await Interview.find({ totalQuestions: { $exists: true } });
  const avgQuestionsPerInterview = interviews.length > 0
    ? interviews.reduce((sum, i) => sum + i.totalQuestions, 0) / interviews.length
    : 0.0;

  // Difficulty distribution
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];
  const difficultyDistribution = {};
  difficulties.forEach(diff => {
    difficultyDistribution[diff] = interviews.filter(i => i.difficulty === diff).length;
  });

  return {
    totalInterviews,
    estimatedApiCalls,
    avgQuestionsPerInterview,
    difficultyDistribution
  };
};

module.exports = {
  getAllUsers,
  searchUsers,
  getUserById,
  suspendUser,
  activateUser,
  deleteUser,
  getPlatformAnalytics,
  getAIUsageStatistics
};
