const mongoose = require('mongoose');

const grnSchema = new mongoose.Schema({
  grnNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  grnDate: {
    type: Date,
    required: [true, 'GRN date is required'],
    default: Date.now
  },
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    trim: true,
    maxlength: [30, 'Invoice number cannot exceed 30 characters']
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  }
}, {
  timestamps: true
});


grnSchema.index({ grnNumber: 1 });
grnSchema.index({ vendorId: 1 });
grnSchema.index({ branchId: 1 });
grnSchema.index({ grnDate: 1 });
grnSchema.index({ status: 1 });


grnSchema.pre('save', async function(next) {
  if (this.isNew && !this.grnNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
  
    const lastGRN = await this.constructor.findOne({
      grnNumber: new RegExp(`^GRN-${year}${month}-`)
    }).sort({ grnNumber: -1 });
    
    let sequence = 1;
    if (lastGRN) {
      const lastSequence = parseInt(lastGRN.grnNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.grnNumber = `GRN-${year}${month}-${String(sequence).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('GRN', grnSchema); 