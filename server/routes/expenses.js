const express = require('express');
const router = express.Router();
const { Expense, Vehicle, Trip } = require('../models');
const { authenticateToken, verifyRole } = require('../middleware/auth');

// GET all expenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { vehicleId, tripId, type } = req.query;
    const whereClause = {};

    if (vehicleId) whereClause.vehicleId = vehicleId;
    if (tripId) whereClause.tripId = tripId;
    if (type) whereClause.type = type;

    const expenses = await Expense.findAll({
      where: whereClause,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['registrationNumber', 'name'] },
        { model: Trip, as: 'trip', attributes: ['source', 'destination'] }
      ],
      order: [['date', 'DESC']]
    });

    return res.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ message: 'Server error fetching expenses', error: error.message });
  }
});

// POST add toll or miscellaneous expense (Managers & Financial Analysts)
router.post('/', authenticateToken, verifyRole(['Fleet Manager', 'Financial Analyst']), async (req, res) => {
  try {
    const { vehicleId, tripId, type, amount, date } = req.body;

    if (!vehicleId || !type || amount === undefined || !date) {
      return res.status(400).json({ message: 'vehicleId, type, amount, and date are required' });
    }

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (tripId) {
      const trip = await Trip.findByPk(tripId);
      if (!trip) {
        return res.status(404).json({ message: 'Linked trip not found' });
      }
    }

    const expense = await Expense.create({
      vehicleId,
      tripId: tripId || null,
      type,
      amount,
      date
    });

    return res.status(201).json({ message: 'Expense logged successfully', expense });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ message: 'Server error creating expense', error: error.message });
  }
});

module.exports = router;
