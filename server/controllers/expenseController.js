const { Expense, Vehicle, Trip } = require('../models');

exports.getExpenses = async (req, res) => {
  try {
    const { vehicleId, tripId, type } = req.query;

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      let expenses = [...mockDb.getExpenses()];
      const vehicles = mockDb.getVehicles();
      const trips = mockDb.getTrips();

      if (vehicleId) expenses = expenses.filter(e => e.vehicleId === parseInt(vehicleId));
      if (tripId) expenses = expenses.filter(e => e.tripId === parseInt(tripId));
      if (type) expenses = expenses.filter(e => e.type === type);

      const populatedExpenses = expenses.map(e => {
        const exp = { ...e };
        const v = vehicles.find(veh => veh.id === exp.vehicleId);
        const t = trips.find(tr => tr.id === exp.tripId);

        exp.vehicle = v ? { registrationNumber: v.registrationNumber, name: v.name } : null;
        exp.trip = t ? { source: t.source, destination: t.destination } : null;
        return exp;
      });

      return res.json({ expenses: populatedExpenses });
    }

    // Standard SQL Mode
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
};

exports.createExpense = async (req, res) => {
  try {
    const { vehicleId, tripId, type, amount, date } = req.body;

    if (!vehicleId || !type || amount === undefined || !date) {
      return res.status(400).json({ message: 'vehicleId, type, amount, and date are required' });
    }

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const expenses = mockDb.getExpenses();
      const vehicles = mockDb.getVehicles();
      const trips = mockDb.getTrips();

      const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      if (tripId) {
        const trip = trips.find(t => t.id === parseInt(tripId));
        if (!trip) {
          return res.status(404).json({ message: 'Linked trip not found' });
        }
      }

      const expense = {
        id: expenses.length + 1,
        vehicleId: parseInt(vehicleId),
        tripId: tripId ? parseInt(tripId) : null,
        type,
        amount: parseFloat(amount),
        date,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expenses.push(expense);

      return res.status(201).json({ message: 'Expense logged successfully (Mock Mode)', expense });
    }

    // Standard SQL Mode
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
};
