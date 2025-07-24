const express = require('express');
const router = express.Router();
const {
  getGRNs,
  getGRN,
  createGRN,
  updateGRN,
  deleteGRN,
  addLineItem,
  updateLineItem,
  deleteLineItem,
  generateGRNReport
} = require('../controllers/grnController');


router.get('/', getGRNs);


router.get('/:id', getGRN);


router.post('/', createGRN);


router.put('/:id', updateGRN);


router.delete('/:id', deleteGRN)
router.post('/:grnId/line-items', addLineItem)
router.put('/:grnId/line-items/:lineItemId', updateLineItem);
router.delete('/:grnId/line-items/:lineItemId', deleteLineItem);
router.get('/report/register', generateGRNReport);

module.exports = router; 