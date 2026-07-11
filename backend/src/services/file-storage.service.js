const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { BadRequestError } = require('../utils/errors');

const uploadDir = process.env.FILE_UPLOAD_DIR || 'uploads';

const storeFile = async (file, folder) => {
  try {
    const folderPath = path.join(uploadDir, folder);
    
    // Create directory recursively if it doesn't exist
    await fs.mkdir(folderPath, { recursive: true });
    
    const originalName = file.originalname || 'file';
    if (originalName.includes('..')) {
      throw new BadRequestError('Filename contains invalid path sequence');
    }
    
    const ext = path.extname(originalName);
    const newFilename = `${crypto.randomUUID()}${ext}`;
    const targetLocation = path.join(folderPath, newFilename);
    
    // Write the buffer from memory to disk
    await fs.writeFile(targetLocation, file.buffer);
    
    const fileUrl = `/api/v1/files/${folder}/${newFilename}`;
    console.log(`File stored successfully: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error('Error storing file:', error);
    if (error instanceof BadRequestError) throw error;
    throw new BadRequestError(`Failed to store file: ${error.message}`);
  }
};

const deleteFile = async (filePath) => {
  try {
    if (!filePath) return;
    
    let actualPath = filePath;
    if (filePath.startsWith('/api/v1/files/')) {
      actualPath = filePath.replace('/api/v1/files/', '');
    }
    
    const targetPath = path.join(uploadDir, actualPath);
    
    try {
      await fs.unlink(targetPath);
      console.log(`File deleted successfully: ${targetPath}`);
    } catch (err) {
      // Don't fail if the file is already gone (ENOENT)
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
};

const getFilePath = (relativePath) => {
  let actualPath = relativePath;
  if (relativePath.startsWith('/api/v1/files/')) {
    actualPath = relativePath.replace('/api/v1/files/', '');
  }
  return path.resolve(uploadDir, actualPath);
};

const getFilePathFromUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/api/v1/files/')) {
    return url.replace('/api/v1/files/', '');
  }
  return url;
};

module.exports = {
  storeFile,
  deleteFile,
  getFilePath,
  getFilePathFromUrl
};
