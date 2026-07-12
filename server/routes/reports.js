const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken, verifyRole } = require('../middleware/auth');

router.get('/csv', authenticateToken, verifyRole(['Fleet Manager', 'Financial Analyst']), reportsController.exportTripsCSV);

module.exports = router;
