const AssetSubcategory = require('../models/AssetSubcategory');


exports.getAssetSubcategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', categoryId = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (categoryId) query.categoryId = categoryId;

    const subcategories = await AssetSubcategory.find(query)
      .populate('categoryId', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await AssetSubcategory.countDocuments(query);

    res.json({
      success: true,
      data: subcategories,
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
      message: 'Error fetching asset subcategories',
      error: error.message
    });
  }
};


exports.getAssetSubcategory = async (req, res) => {
  try {
    const subcategory = await AssetSubcategory.findById(req.params.id)
      .populate('categoryId', 'name');
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Asset subcategory not found'
      });
    }
    res.json({
      success: true,
      data: subcategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching asset subcategory',
      error: error.message
    });
  }
};


exports.createAssetSubcategory = async (req, res) => {
  try {
    const subcategory = new AssetSubcategory(req.body);
    await subcategory.save();
    const populatedSubcategory = await AssetSubcategory.findById(subcategory._id)
      .populate('categoryId', 'name');
    res.status(201).json({
      success: true,
      message: 'Asset subcategory created successfully',
      data: populatedSubcategory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating asset subcategory',
      error: error.message
    });
  }
};


exports.updateAssetSubcategory = async (req, res) => {
  try {
    const subcategory = await AssetSubcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');
    
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Asset subcategory not found'
      });
    }
    res.json({
      success: true,
      message: 'Asset subcategory updated successfully',
      data: subcategory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating asset subcategory',
      error: error.message
    });
  }
};


exports.deleteAssetSubcategory = async (req, res) => {
  try {
    const subcategory = await AssetSubcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Asset subcategory not found'
      });
    }
    res.json({
      success: true,
      message: 'Asset subcategory deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting asset subcategory',
      error: error.message
    });
  }
}; 