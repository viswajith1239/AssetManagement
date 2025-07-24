const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAssetCategories,
  getAssetCategory,
  createAssetCategory,
  updateAssetCategory,
  deleteAssetCategory,
  exportToExcel,
  importFromExcel
} = require('../controllers/assetCategoryController');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});


router.get('/export/excel', exportToExcel);
router.post('/import/excel', upload.single('file'), importFromExcel);
router.get('/', getAssetCategories);
router.get('/:id', getAssetCategory);
router.post('/', createAssetCategory);
router.put('/:id', updateAssetCategory);
router.delete('/:id', deleteAssetCategory);



module.exports = router; 