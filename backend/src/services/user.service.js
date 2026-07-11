const User = require('../models/user.model');
const fileStorageService = require('./file-storage.service');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const modelMapper = require('../utils/model-mapper');
const bcrypt = require('bcryptjs');

const getUserProfile = async (userId) => {
  console.log(`Getting user profile for user: ${userId}`);
  const user = await findUserById(userId);
  return modelMapper.toUserProfileDTO(user);
};

const updateProfile = async (userId, request) => {
  console.log(`Updating profile for user: ${userId}`);
  const user = await findUserById(userId);
  
  if (request.firstName !== undefined) user.firstName = request.firstName;
  if (request.lastName !== undefined) user.lastName = request.lastName;
  if (request.phone !== undefined) user.phone = request.phone;
  if (request.skills !== undefined) user.skills = request.skills;
  if (request.experience !== undefined) user.experience = request.experience;
  
  await user.save();
  console.log(`Profile updated successfully for user: ${userId}`);
  return modelMapper.toUserProfileDTO(user);
};

const changePassword = async (userId, request) => {
  console.log(`Changing password for user: ${userId}`);
  const user = await findUserById(userId);
  
  const isMatch = await bcrypt.compare(request.currentPassword, user.password);
  if (!isMatch) {
    throw new BadRequestError('Current password is incorrect');
  }
  
  user.password = await bcrypt.hash(request.newPassword, 10);
  await user.save();
  console.log(`Password changed successfully for user: ${userId}`);
};

const uploadProfileImage = async (userId, file) => {
  console.log(`Uploading profile image for user: ${userId}`);
  
  const contentType = file.mimetype;
  if (!contentType || !contentType.startsWith('image/')) {
    throw new BadRequestError('Only image files are allowed');
  }
  
  const user = await findUserById(userId);
  
  // Delete old image if it exists
  if (user.profileImageUrl) {
    const oldFilePath = fileStorageService.getFilePathFromUrl(user.profileImageUrl);
    await fileStorageService.deleteFile(oldFilePath);
  }
  
  // Upload new image
  const imagePath = await fileStorageService.storeFile(file, 'profile-images');
  
  const extractFileName = (p) => {
    if (!p) return '';
    const parts = p.split('/');
    return parts[parts.length - 1];
  };
  
  const imageUrl = `/api/v1/files/profile-images/${extractFileName(imagePath)}`;
  user.profileImageUrl = imageUrl;
  await user.save();
  
  console.log(`Profile image uploaded successfully for user: ${userId}`);
  return modelMapper.toUserProfileDTO(user);
};

const addSkill = async (userId, skill) => {
  console.log(`Adding skill '${skill}' for user: ${userId}`);
  const user = await findUserById(userId);
  
  if (!user.skills.includes(skill)) {
    user.skills.push(skill);
    await user.save();
    console.log('Skill added successfully');
  }
};

const removeSkill = async (userId, skill) => {
  console.log(`Removing skill '${skill}' for user: ${userId}`);
  const user = await findUserById(userId);
  
  user.skills = user.skills.filter(s => s !== skill);
  await user.save();
  console.log('Skill removed successfully');
};

const findUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

module.exports = {
  getUserProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  addSkill,
  removeSkill,
  findUserById
};
