const express = require('express');
const router = express.Router();
const { Vehicle, Trip } = require('../models');
const { authenticateToken, verifyRole } = require('../middleware/auth');
const { Op } = require('sequelize');

// GET all vehicles (with filters by type, status, region, and general search)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, region, search } = req.query;
    const whereClause = {};

    if (type && type !== 'All') {
      whereClause.type = type;
    }
    if (status && status !== 'All') {
      whereClause.status = status;
    }
    if (region && region !== 'All') {
      whereClause.region = region;
    }
    if (search) {
      whereClause[Op.or] = [
        { registrationNumber: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } }
      ];
    }

    const vehicles = await Vehicle.findAll({ where: whereClause });
    return res.json({ vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ message: 'Server error fetching vehicles', error: error.message });
  }
});

// GET single vehicle
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    return res.json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return res.status(500).json({ message: 'Server error fetching vehicle', error: error.message });
  }
});

// POST create vehicle (Managers only)
router.post('/', authenticateToken, verifyRole(['Fleet Manager']), async (req, res) => {
  try {
    const { registrationNumber, name, model, type, region, maxLoadCapacity, odometer, acquisitionCost } = req.body;

    if (!registrationNumber || !name || !model || !type || !region || !maxLoadCapacity || !acquisitionCost) {
      return res.status(400).json({ message: 'All fields except odometer are required' });
    }

    // Check unique registrationNumber
    const existing = await Vehicle.findOne({ where: { registrationNumber } });
    if (existing) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      name,
      model,
      type,
      region,
      maxLoadCapacity,
      odometer: odometer || 0.00,
      acquisitionCost,
      status: 'Available'
    });

    return res.status(201).json({ message: 'Vehicle created successfully', vehicle });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return res.status(500).json({ message: 'Server error creating vehicle', error: error.message });
  }
});

// PUT update vehicle (Managers only)
router.put('/:id', authenticateToken, verifyRole(['Fleet Manager']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const { registrationNumber, name, model, type, region, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;

    if (registrationNumber && registrationNumber !== vehicle.registrationNumber) {
      const existing = await Vehicle.findOne({ where: { registrationNumber } });
      if (existing) {
        return res.status(400).json({ message: 'Registration number already exists' });
      }
    }

    // Edge Case: Block manual status updating if vehicle is currently on a trip
    if (status && status !== vehicle.status) {
      if (vehicle.status === 'On Trip' && status !== 'On Trip') {
        // Check if there is an active dispatched trip for this vehicle
        const activeTrip = await Trip.findOne({ where: { vehicleId: vehicle.id, status: 'Dispatched' } });
        if (activeTrip) {
          return res.status(400).json({ message: 'Cannot change vehicle status while it is currently dispatched on an active trip' });
        }
      }
    }

    await vehicle.update({
      registrationNumber: registrationNumber || vehicle.registrationNumber,
      name: name || vehicle.name,
      model: model || vehicle.model,
      type: type || vehicle.type,
      region: region || vehicle.region,
      maxLoadCapacity: maxLoadCapacity || vehicle.maxLoadCapacity,
      odometer: odometer !== undefined ? odometer : vehicle.odometer,
      acquisitionCost: acquisitionCost || vehicle.acquisitionCost,
      status: status || vehicle.status
    });

    return res.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return res.status(500).json({ message: 'Server error updating vehicle', error: error.message });
  }
});

// DELETE vehicle (Managers only)
router.delete('/:id', authenticateToken, verifyRole(['Fleet Manager']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if assigned to an active trip
    if (vehicle.status === 'On Trip') {
      const activeTrip = await Trip.findOne({ where: { vehicleId: vehicle.id, status: 'Dispatched' } });
      if (activeTrip) {
        return res.status(400).json({ message: 'Cannot delete vehicle currently deployed on an active trip' });
      }
    }

    await vehicle.destroy();
    return res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return res.status(500).json({ message: 'Server error deleting vehicle', error: error.message });
  }
});

module.exports = router;
