const mongoose = require('mongoose');

const assetCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});


assetCategorySchema.index({ name: 1 });
assetCategorySchema.index({ status: 1 });

module.exports = mongoose.model('AssetCategory', assetCategorySchema); 