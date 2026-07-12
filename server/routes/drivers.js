const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticateToken, verifyRole } = require('../middleware/auth');

router.get('/', authenticateToken, driverController.getDrivers);
router.get('/:id', authenticateToken, driverController.getDriverById);
router.post('/', authenticateToken, verifyRole(['Fleet Manager']), driverController.createDriver);
router.put('/:id', authenticateToken, verifyRole(['Fleet Manager', 'Safety Officer']), driverController.updateDriver);
router.delete('/:id', authenticateToken, verifyRole(['Fleet Manager']), driverController.deleteDriver);

module.exports = router;
