const { body, validationResult } = require('express-validator');
const ApiResponse = require('../utils/api-response');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorsMap = {};
    errors.array().forEach(err => {
      const field = err.path || err.param;
      errorsMap[field] = err.msg;
    });

    return res.status(400).json(
      ApiResponse.error('Validation failed', 'VALIDATION_ERROR', 'Invalid input data', errorsMap)
    );
  };
};

const registerSchema = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().trim().isString()
];

const loginSchema = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

const changePasswordSchema = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

const startInterviewSchema = [
  body('jobRole').trim().notEmpty().withMessage('Job role is required'),
  body('domain').isIn(['JAVA', 'SPRING_BOOT', 'MERN', 'DSA', 'HR', 'SQL', 'JAVASCRIPT', 'CODEFORCES'])
    .withMessage('Must be a valid domain'),
  body('difficulty').isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Must be a valid difficulty level'),
  body('numberOfQuestions').isInt({ min: 1, max: 20 }).withMessage('Number of questions must be between 1 and 20')
];

const submitAnswerSchema = [
  body('questionId').trim().notEmpty().withMessage('Question ID is required'),
  body('answerText').trim().notEmpty().withMessage('Answer text is required')
];

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  startInterviewSchema,
  submitAnswerSchema
};
