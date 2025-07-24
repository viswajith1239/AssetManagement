const GRN = require('../models/GRN');
const GRNLineItem = require('../models/GRNLineItems');
const Vendor = require('../models/Vendor');
const Branch = require('../models/Branch');
const AssetSubcategory = require('../models/AssetSubcategory');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');


exports.getGRNs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      vendorId = '',
      branchId = '',
      startDate = '',
      endDate = ''
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { grnNumber: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;
    if (branchId) query.branchId = branchId;
    
    if (startDate || endDate) {
      query.grnDate = {};
      if (startDate) query.grnDate.$gte = new Date(startDate);
      if (endDate) query.grnDate.$lte = new Date(endDate);
    }

    const grns = await GRN.find(query)
      .populate('vendorId', 'name')
      .populate('branchId', 'name location')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await GRN.countDocuments(query);

    res.json({
      success: true,
      data: grns,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching GRNs',
      error: error.message
    });
  }
};


exports.getGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id)
      .populate('vendorId', 'name contactPerson email phone')
      .populate('branchId', 'name location code');
    
    if (!grn) {
      return res.status(404).json({
        success: false,
        message: 'GRN not found'
      });
    }

    const lineItems = await GRNLineItem.find({ grnId: grn._id })
      .populate('subcategoryId', 'name')
      .populate({
        path: 'subcategoryId',
        populate: { path: 'categoryId', select: 'name' }
      });

    res.json({
      success: true,
      data: {
        ...grn.toObject(),
        lineItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching GRN',
      error: error.message
    });
  }
};


exports.createGRN = async (req, res) => {
  try {
    const { lineItems, ...grnData } = req.body;
    
   
    const grn = new GRN(grnData);
    await grn.save();

 
    if (lineItems && lineItems.length > 0) {
      const lineItemData = lineItems.map(item => ({
        ...item,
        grnId: grn._id
      }));
      
      await GRNLineItem.insertMany(lineItemData);
    }


    await calculateGRNTotals(grn._id);

    const populatedGRN = await GRN.findById(grn._id)
      .populate('vendorId', 'name')
      .populate('branchId', 'name');

    res.status(201).json({
      success: true,
      message: 'GRN created successfully',
      data: populatedGRN
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating GRN',
      error: error.message
    });
  }
};


exports.updateGRN = async (req, res) => {
  try {
    const { lineItems, ...grnData } = req.body;
    
    const grn = await GRN.findByIdAndUpdate(
      req.params.id,
      grnData,
      { new: true, runValidators: true }
    );

    if (!grn) {
      return res.status(404).json({
        success: false,
        message: 'GRN not found'
      });
    }

  
    if (lineItems) {
    
      await GRNLineItem.deleteMany({ grnId: grn._id });
      
     
      if (lineItems.length > 0) {
        const lineItemData = lineItems.map(item => ({
          ...item,
          grnId: grn._id
        }));
        
        await GRNLineItem.insertMany(lineItemData);
      }
    }


    await calculateGRNTotals(grn._id);

    const populatedGRN = await GRN.findById(grn._id)
      .populate('vendorId', 'name')
      .populate('branchId', 'name');

    res.json({
      success: true,
      message: 'GRN updated successfully',
      data: populatedGRN
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating GRN',
      error: error.message
    });
  }
};


exports.deleteGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id);
    if (!grn) {
      return res.status(404).json({
        success: false,
        message: 'GRN not found'
      });
    }

  
    await GRNLineItem.deleteMany({ grnId: grn._id });
    
 
    await GRN.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'GRN deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting GRN',
      error: error.message
    });
  }
};


exports.addLineItem = async (req, res) => {
  try {
    const lineItem = new GRNLineItem({
      ...req.body,
      grnId: req.params.grnId
    });
    
    await lineItem.save();
    await calculateGRNTotals(req.params.grnId);

    const populatedLineItem = await GRNLineItem.findById(lineItem._id)
      .populate('subcategoryId', 'name')
      .populate({
        path: 'subcategoryId',
        populate: { path: 'categoryId', select: 'name' }
      });

    res.status(201).json({
      success: true,
      message: 'Line item added successfully',
      data: populatedLineItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding line item',
      error: error.message
    });
  }
};


exports.updateLineItem = async (req, res) => {
  try {
    const lineItem = await GRNLineItem.findByIdAndUpdate(
      req.params.lineItemId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!lineItem) {
      return res.status(404).json({
        success: false,
        message: 'Line item not found'
      });
    }

    await calculateGRNTotals(lineItem.grnId);

    const populatedLineItem = await GRNLineItem.findById(lineItem._id)
      .populate('subcategoryId', 'name')
      .populate({
        path: 'subcategoryId',
        populate: { path: 'categoryId', select: 'name' }
      });

    res.json({
      success: true,
      message: 'Line item updated successfully',
      data: populatedLineItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating line item',
      error: error.message
    });
  }
};


exports.deleteLineItem = async (req, res) => {
  try {
    const lineItem = await GRNLineItem.findById(req.params.lineItemId);
    if (!lineItem) {
      return res.status(404).json({
        success: false,
        message: 'Line item not found'
      });
    }

    await GRNLineItem.findByIdAndDelete(req.params.lineItemId);
    await calculateGRNTotals(lineItem.grnId);

    res.json({
      success: true,
      message: 'Line item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting line item',
      error: error.message
    });
  }
};


exports.generateGRNReport = async (req, res) => {
  try {
    const { 
      startDate = '', 
      endDate = '', 
      vendorId = '', 
      branchId = '',
      format = 'json'
    } = req.query;
    
    const query = {};
    
    if (startDate || endDate) {
      query.grnDate = {};
      if (startDate) query.grnDate.$gte = new Date(startDate);
      if (endDate) query.grnDate.$lte = new Date(endDate);
    }
    
    if (vendorId) query.vendorId = vendorId;
    if (branchId) query.branchId = branchId;

    const grns = await GRN.find(query)
      .populate('vendorId', 'name')
      .populate('branchId', 'name location')
      .sort({ grnDate: -1 });

    const reportData = grns.map(grn => ({
      'GRN Number': grn.grnNumber,
      'GRN Date': grn.grnDate.toLocaleDateString(),
      'Invoice Number': grn.invoiceNumber,
      'Vendor Name': grn.vendorId?.name || '',
      'Branch Name': grn.branchId?.name || '',
      'Branch Location': grn.branchId?.location || '',
      'Total Amount': grn.totalAmount,
      'Total Tax': grn.totalTax,
      'Grand Total': grn.grandTotal,
      'Status': grn.status
    }));

    if (format === 'excel') {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'GRN Register');
      
      const fileName = `grn_register_${Date.now()}.xlsx`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      
      XLSX.writeFile(workbook, filePath);
      
      res.download(filePath, fileName, (err) => {
        if (err) console.error('Download error:', err);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('File cleanup error:', unlinkErr);
        });
      });
    } else {
      res.json({
        success: true,
        data: reportData
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating GRN report',
      error: error.message
    });
  }
};


async function calculateGRNTotals(grnId) {
  const lineItems = await GRNLineItem.find({ grnId });
  
  const totalAmount = lineItems.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalTax = lineItems.reduce((sum, item) => sum + (item.taxableValue * item.taxPercent / 100), 0);
  const grandTotal = totalAmount + totalTax;

  await GRN.findByIdAndUpdate(grnId, {
    totalAmount,
    totalTax,
    grandTotal
  });
} 