const express = require('express');
const router = express.Router();
const { MaintenanceLog, Vehicle, sequelize } = require('../models');
const { authenticateToken, verifyRole } = require('../middleware/auth');

// GET all maintenance logs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, vehicleId } = req.query;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (vehicleId) whereClause.vehicleId = vehicleId;

    const logs = await MaintenanceLog.findAll({
      where: whereClause,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['registrationNumber', 'name', 'model', 'type'] }
      ],
      order: [['startDate', 'DESC']]
    });

    return res.json({ logs });
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    return res.status(500).json({ message: 'Server error fetching maintenance logs', error: error.message });
  }
});

// POST log active maintenance (Atomically toggles vehicle status to In Shop)
router.post('/', authenticateToken, verifyRole(['Fleet Manager']), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { vehicleId, description, cost, startDate } = req.body;

    if (!vehicleId || !description || cost === undefined || !startDate) {
      await transaction.rollback();
      return res.status(400).json({ message: 'vehicleId, description, cost, and startDate are required' });
    }

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Edge Case Rule: Block maintenance if vehicle is currently on a trip
    if (vehicle.status === 'On Trip') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cannot place vehicle in maintenance while it is currently deployed on an active trip' });
    }

    // Create Maintenance Log
    const log = await MaintenanceLog.create({
      vehicleId,
      description,
      cost,
      startDate,
      status: 'Active'
    }, { transaction });

    // Update vehicle status to In Shop
    await vehicle.update({ status: 'In Shop' }, { transaction });

    await transaction.commit();
    return res.status(201).json({ message: 'Maintenance record created and vehicle status set to In Shop', log });
  } catch (error) {
    await transaction.rollback();
    console.error('Create maintenance error:', error);
    return res.status(500).json({ message: 'Server error creating maintenance entry', error: error.message });
  }
});

// PUT close active maintenance (Atomically restores vehicle status to Available)
router.put('/:id/close', authenticateToken, verifyRole(['Fleet Manager']), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { endDate } = req.body;
    const log = await MaintenanceLog.findByPk(req.params.id);

    if (!log) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    if (log.status === 'Closed') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Maintenance log is already closed' });
    }

    const finalEndDate = endDate || new Date().toISOString().split('T')[0];

    // Validation: End date cannot be before start date
    if (finalEndDate < log.startDate) {
      await transaction.rollback();
      return res.status(400).json({ message: `End date (${finalEndDate}) cannot be before start date (${log.startDate})` });
    }

    const vehicle = await Vehicle.findByPk(log.vehicleId);

    // Update Log
    await log.update({
      endDate: finalEndDate,
      status: 'Closed'
    }, { transaction });

    // Update Vehicle back to Available (unless it was retired)
    if (vehicle && vehicle.status === 'In Shop') {
      await vehicle.update({ status: 'Available' }, { transaction });
    }

    await transaction.commit();
    return res.json({ message: 'Maintenance record closed and vehicle returned to Available status', log });
  } catch (error) {
    await transaction.rollback();
    console.error('Close maintenance error:', error);
    return res.status(500).json({ message: 'Server error closing maintenance entry', error: error.message });
  }
});

module.exports = router;
