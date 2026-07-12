const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken, verifyRole } = require('../middleware/auth');

router.get('/', authenticateToken, vehicleController.getVehicles);
router.get('/:id', authenticateToken, vehicleController.getVehicleById);
router.post('/', authenticateToken, verifyRole(['Fleet Manager']), vehicleController.createVehicle);
router.put('/:id', authenticateToken, verifyRole(['Fleet Manager']), vehicleController.updateVehicle);
router.delete('/:id', authenticateToken, verifyRole(['Fleet Manager']), vehicleController.deleteVehicle);

module.exports = router;
