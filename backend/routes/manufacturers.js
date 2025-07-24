const express = require('express');
const router = express.Router();
const {
  getManufacturers,
  getManufacturer,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer
} = require('../controllers/manufacturerController');


router.get('/', getManufacturers);
router.get('/:id', getManufacturer);
router.post('/', createManufacturer);
router.put('/:id', updateManufacturer);
router.delete('/:id', deleteManufacturer);

module.exports = router; 