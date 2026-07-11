const cloudinary = require('../config/cloudinary');

const isConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  return !!(
    cloudName && cloudName.trim() !== '' && cloudName !== 'your-cloudinary-cloud-name' &&
    apiKey && apiKey.trim() !== '' && apiKey !== 'your-cloudinary-api-key' &&
    apiSecret && apiSecret.trim() !== '' && apiSecret !== 'your-cloudinary-api-secret'
  );
};

const uploadFile = (file, folder) => {
  return new Promise((resolve, reject) => {
    console.log(`Uploading file to Cloudinary folder '${folder}'`);
    
    // Using upload_stream to upload memory buffer directly to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    
    uploadStream.end(file.buffer);
  });
};

const deleteFile = async (publicId) => {
  if (!publicId || publicId.trim() === '') return;
  try {
    console.log(`Deleting file from Cloudinary: ${publicId}`);
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete file from Cloudinary: ${publicId}`, error);
  }
};

module.exports = {
  isConfigured,
  uploadFile,
  deleteFile
};
