const express = require('express');
const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
} = require('../controllers/opportunityController');
const {
  validateCreate,
  validateId,
} = require('../middleware/validateOpportunity');

const router = express.Router();

router.post('/', validateCreate, createOpportunity);
router.get('/', getAllOpportunities);
router.get('/:id', validateId, getOpportunityById);

module.exports = router;
