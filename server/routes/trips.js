const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticateToken, verifyRole } = require('../middleware/auth');

router.get('/', authenticateToken, tripController.getTrips);
router.get('/:id', authenticateToken, tripController.getTripById);
router.post('/', authenticateToken, verifyRole(['Fleet Manager', 'Driver']), tripController.createTripDraft);
router.post('/:id/dispatch', authenticateToken, verifyRole(['Fleet Manager', 'Driver']), tripController.dispatchTrip);
router.post('/:id/complete', authenticateToken, verifyRole(['Fleet Manager', 'Driver']), tripController.completeTrip);
router.post('/:id/cancel', authenticateToken, verifyRole(['Fleet Manager', 'Driver']), tripController.cancelTrip);

module.exports = router;
