const fs = require('fs');
const fileStorageService = require('../services/file-storage.service');

const getProfileImage = (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = fileStorageService.getFilePath(`profile-images/${filename}`);
    
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.sendFile(filePath);
    } else {
      return res.status(404).send('Not Found');
    }
  } catch (error) {
    next(error);
  }
};

const getResume = (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = fileStorageService.getFilePath(`resumes/${filename}`);
    
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.sendFile(filePath);
    } else {
      return res.status(404).send('Not Found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfileImage,
  getResume
};
