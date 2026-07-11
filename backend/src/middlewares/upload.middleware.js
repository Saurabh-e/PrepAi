const multer = require('multer');

// Configure memory storage to process file buffers (PDF, DOCX, Images)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
