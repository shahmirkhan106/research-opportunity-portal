const express = require('express');
const { createOpportunity } = require('../controllers/opportunityController');
const { validateCreate } = require('../middleware/validateOpportunity');

const router = express.Router();

router.post('/', validateCreate, createOpportunity);

module.exports = router;
