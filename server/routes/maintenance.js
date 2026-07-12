const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken, verifyRole } = require('../middleware/auth');

router.get('/', authenticateToken, maintenanceController.getMaintenanceLogs);
router.post('/', authenticateToken, verifyRole(['Fleet Manager']), maintenanceController.createMaintenanceLog);
router.put('/:id/close', authenticateToken, verifyRole(['Fleet Manager']), maintenanceController.closeMaintenanceLog);

module.exports = router;
