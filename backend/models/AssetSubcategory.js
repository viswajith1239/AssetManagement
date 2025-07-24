const mongoose = require('mongoose');

const assetSubcategorySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssetCategory',
    required: [true, 'Category is required']
  },
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
    maxlength: [100, 'Subcategory name cannot exceed 100 characters']
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


assetSubcategorySchema.index({ categoryId: 1 });
assetSubcategorySchema.index({ name: 1 });
assetSubcategorySchema.index({ status: 1 });

module.exports = mongoose.model('AssetSubcategory', assetSubcategorySchema); 