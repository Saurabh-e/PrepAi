const getCurrentUserId = (req) => {
  return req.user ? req.user.id : null;
};

const getCurrentUser = (req) => {
  return req.user || null;
};

module.exports = {
  getCurrentUserId,
  getCurrentUser
};
