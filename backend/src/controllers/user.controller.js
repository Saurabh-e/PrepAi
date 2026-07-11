const userService = require('../services/user.service');
const ApiResponse = require('../utils/api-response');
const { getCurrentUserId } = require('../utils/security.utils');

const getProfile = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const profile = await userService.getUserProfile(userId);
    return res.status(200).json(ApiResponse.success(profile));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const profile = await userService.updateProfile(userId, req.body);
    return res.status(200).json(ApiResponse.success('Profile updated successfully', profile));
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    await userService.changePassword(userId, req.body);
    return res.status(200).json(ApiResponse.success('Password changed successfully', null));
  } catch (error) {
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error('File parameter is required'));
    }
    const userId = getCurrentUserId(req);
    const profile = await userService.uploadProfileImage(userId, req.file);
    return res.status(200).json(ApiResponse.success('Profile image uploaded successfully', profile));
  } catch (error) {
    next(error);
  }
};

const addSkill = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const skill = req.query.skill || req.body.skill;
    if (!skill) {
      return res.status(400).json(ApiResponse.error('Skill parameter is required'));
    }
    await userService.addSkill(userId, skill);
    return res.status(200).json(ApiResponse.success('Skill added successfully', null));
  } catch (error) {
    next(error);
  }
};

const removeSkill = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const skill = req.query.skill || req.body.skill;
    if (!skill) {
      return res.status(400).json(ApiResponse.error('Skill parameter is required'));
    }
    await userService.removeSkill(userId, skill);
    return res.status(200).json(ApiResponse.success('Skill removed successfully', null));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  addSkill,
  removeSkill
};
