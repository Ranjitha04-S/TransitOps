const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateToken, verifyRole } = require('../middleware/auth');

router.get('/', authenticateToken, expenseController.getExpenses);
router.post('/', authenticateToken, verifyRole(['Fleet Manager', 'Financial Analyst']), expenseController.createExpense);

module.exports = router;
