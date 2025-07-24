const Manufacturer = require('../models/Manufacturer');


exports.getManufacturers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;

    const manufacturers = await Manufacturer.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Manufacturer.countDocuments(query);

    res.json({
      success: true,
      data: manufacturers,
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
      message: 'Error fetching manufacturers',
      error: error.message
    });
  }
};


exports.getManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.id);
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }
    res.json({
      success: true,
      data: manufacturer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching manufacturer',
      error: error.message
    });
  }
};


exports.createManufacturer = async (req, res) => {
  try {
    const manufacturer = new Manufacturer(req.body);
    await manufacturer.save();
    res.status(201).json({
      success: true,
      message: 'Manufacturer created successfully',
      data: manufacturer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating manufacturer',
      error: error.message
    });
  }
};


exports.updateManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }
    res.json({
      success: true,
      message: 'Manufacturer updated successfully',
      data: manufacturer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating manufacturer',
      error: error.message
    });
  }
};


exports.deleteManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findByIdAndDelete(req.params.id);
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }
    res.json({
      success: true,
      message: 'Manufacturer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting manufacturer',
      error: error.message
    });
  }
}; 