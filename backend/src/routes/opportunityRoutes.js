const express = require('express');
const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
} = require('../controllers/opportunityController');
const {
  validateCreate,
  validateUpdate,
  validateId,
} = require('../middleware/validateOpportunity');

const router = express.Router();

router.post('/', validateCreate, createOpportunity);
router.get('/', getAllOpportunities);
router.get('/:id', validateId, getOpportunityById);
router.put('/:id', validateId, validateUpdate, updateOpportunity);

module.exports = router;
