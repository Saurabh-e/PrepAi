const ApiResponse = require('../utils/api-response');

const errorHandler = (err, req, res, next) => {
  // If the error is a Multer limit error (e.g. file size limit exceeded)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(
      ApiResponse.error('File upload failed', 'FILE_SIZE_EXCEEDED', 'File size exceeds maximum allowed size of 10MB')
    );
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const details = err.details || null;
  const validationErrors = err.validationErrors || null;

  if (status === 500) {
    console.error('Unexpected Error:', err);
    return res.status(500).json(
      ApiResponse.error('Internal server error', 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred. Please try again later.')
    );
  }

  return res.status(status).json(
    ApiResponse.error(message, code, details || message, validationErrors)
  );
};

module.exports = errorHandler;
