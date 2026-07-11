const success = (arg1, arg2) => {
  if (arg2 !== undefined) {
    return {
      success: true,
      message: arg1,
      data: arg2,
      timestamp: new Date().toISOString()
    };
  }
  return {
    success: true,
    data: arg1,
    timestamp: new Date().toISOString()
  };
};

const error = (message, code = null, details = null, validationErrors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (code || details || validationErrors) {
    response.error = {
      code,
      details,
      validationErrors
    };
  }

  return response;
};

module.exports = {
  success,
  error
};
