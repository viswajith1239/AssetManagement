const multer = require('multer');
const path = require('path');
const { APP_CONSTANTS } = require('../config/constants');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, APP_CONSTANTS.UPLOAD.UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = APP_CONSTANTS.UPLOAD.ALLOWED_FILE_TYPES;
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};


const upload = multer({
  storage: storage,
  limits: {
    fileSize: APP_CONSTANTS.UPLOAD.MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

module.exports = upload; 