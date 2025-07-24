const express = require('express');
const router = express.Router();
const {
  getAssetSubcategories,
  getAssetSubcategory,
  createAssetSubcategory,
  updateAssetSubcategory,
  deleteAssetSubcategory
} = require('../controllers/assetSubcategoryController');


router.get('/', getAssetSubcategories)
router.get('/:id', getAssetSubcategory);
router.post('/', createAssetSubcategory);
router.put('/:id', updateAssetSubcategory);
router.delete('/:id', deleteAssetSubcategory);

module.exports = router; 