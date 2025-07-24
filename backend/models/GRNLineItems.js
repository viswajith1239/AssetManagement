const mongoose = require('mongoose');

const grnLineItemSchema = new mongoose.Schema({
  grnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GRN',
    required: [true, 'GRN ID is required']
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssetSubcategory',
    required: [true, 'Subcategory is required']
  },
  itemDescription: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
    maxlength: [100, 'Item description cannot exceed 100 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  taxPercent: {
    type: Number,
    default: 0,
    min: [0, 'Tax percentage cannot be negative'],
    max: [100, 'Tax percentage cannot exceed 100']
  },
  taxableValue: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


grnLineItemSchema.index({ grnId: 1 });
grnLineItemSchema.index({ subcategoryId: 1 });


grnLineItemSchema.pre('save', function(next) {
  this.taxableValue = this.quantity * this.unitPrice;
  this.totalAmount = this.taxableValue + (this.taxableValue * this.taxPercent / 100);
  next();
});

module.exports = mongoose.model('GRNLineItem', grnLineItemSchema); 