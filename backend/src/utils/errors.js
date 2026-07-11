class AppError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class BadRequestError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

class NotFoundError extends AppError {
  constructor(message, details = null) {
    super(message, 404, 'RESOURCE_NOT_FOUND', details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message, details = null) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

class ForbiddenError extends AppError {
  constructor(message, details = null) {
    super(message, 403, 'ACCESS_DENIED', details);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
};
