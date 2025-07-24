const AssetCategory = require('../models/AssetCategory');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');


exports.getAssetCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const categories = await AssetCategory.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await AssetCategory.countDocuments(query);

    res.json({
      success: true,
      data: categories,
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
      message: 'Error fetching asset categories',
      error: error.message
    });
  }
};


exports.getAssetCategory = async (req, res) => {
  try {
    const category = await AssetCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Asset category not found'
      });
    }
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching asset category',
      error: error.message
    });
  }
};


exports.createAssetCategory = async (req, res) => {
  try {
    const category = new AssetCategory(req.body);
    await category.save();
    res.status(201).json({
      success: true,
      message: 'Asset category created successfully',
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating asset category',
      error: error.message
    });
  }
};


exports.updateAssetCategory = async (req, res) => {
  try {
    const category = await AssetCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Asset category not found'
      });
    }
    res.json({
      success: true,
      message: 'Asset category updated successfully',
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating asset category',
      error: error.message
    });
  }
};


exports.deleteAssetCategory = async (req, res) => {
  try {
    const category = await AssetCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Asset category not found'
      });
    }
    res.json({
      success: true,
      message: 'Asset category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting asset category',
      error: error.message
    });
  }
};


exports.exportToExcel = async (req, res) => {
  try {
    const categories = await AssetCategory.find().sort({ createdAt: -1 });
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(categories.map(cat => ({
      'Category Name': cat.name,
      'Description': cat.description,
      'Status': cat.status,
      'Created At': cat.createdAt.toLocaleDateString(),
      'Updated At': cat.updatedAt.toLocaleDateString()
    })));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Categories');
    
    const fileName = `asset_categories_${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, '../uploads', fileName);
    
    XLSX.writeFile(workbook, filePath);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
     
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('File cleanup error:', unlinkErr);
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting asset categories',
      error: error.message
    });
  }
};


exports.importFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel file'
      });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const categories = [];
    for (const row of data) {
      const category = new AssetCategory({
        name: row['Category Name'] || row['Name'],
        description: row['Description'] || '',
        status: row['Status'] || 'active'
      });
      categories.push(category);
    }

    await AssetCategory.insertMany(categories);


    fs.unlink(req.file.path, (err) => {
      if (err) console.error('File cleanup error:', err);
    });

    res.json({
      success: true,
      message: `${categories.length} asset categories imported successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error importing asset categories',
      error: error.message
    });
  }
}; 