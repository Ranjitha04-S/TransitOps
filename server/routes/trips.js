const express = require('express');
const router = express.Router();
const { Trip, Vehicle, Driver, sequelize } = require('../models');
const { authenticateToken, verifyRole } = require('../middleware/auth');

// GET all trips (with simple filter by status and pagination support)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, vehicleId, driverId } = req.query;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (vehicleId) whereClause.vehicleId = vehicleId;
    if (driverId) whereClause.driverId = driverId;

    const trips = await Trip.findAll({
      where: whereClause,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['registrationNumber', 'name', 'model', 'type'] },
        { model: Driver, as: 'driver', attributes: ['name', 'licenseNumber', 'status'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({ message: 'Server error fetching trips', error: error.message });
  }
});

// GET single trip
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' }
      ]
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    return res.json({ trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return res.status(500).json({ message: 'Server error fetching trip', error: error.message });
  }
});

// POST create trip draft
router.post('/', authenticateToken, verifyRole(['Fleet Manager', 'Driver']), async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue } = req.body;

    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance || !revenue) {
      return res.status(400).json({ message: 'All fields are required to draft a trip' });
    }

    const trip = await Trip.create({
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDistance,
      revenue,
      status: 'Draft'
    });

    return res.status(201).json({ message: 'Trip draft created successfully', trip });
  } catch (error) {
    console.error('Error drafting trip:', error);
    return res.status(500).json({ message: 'Server error drafting trip', error: error.message });
  }
});

// POST dispatch trip (implements transaction-safe business rules validation)
router.post('/:id/dispatch', authenticateToken, verifyRole(['Fleet Manager', 'Driver']), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Draft') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only Draft trips can be dispatched' });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);

    if (!vehicle || !driver) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Assigned vehicle or driver does not exist' });
    }

    // Business Rule 1: Vehicle must be available (Not On Trip, In Shop, or Retired)
    if (vehicle.status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({ message: `Vehicle is unavailable (Current status: ${vehicle.status})` });
    }

    // Business Rule 2: Driver must be available (Not On Trip, Off Duty, or Suspended)
    if (driver.status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({ message: `Driver is unavailable (Current status: ${driver.status})` });
    }

    // Business Rule 3: License expiry validation
    const today = new Date().toISOString().split('T')[0];
    if (driver.licenseExpiryDate < today) {
      await transaction.rollback();
      return res.status(400).json({ message: `Driver license is expired (Expiry Date: ${driver.licenseExpiryDate})` });
    }

    // Business Rule 4: Cargo Weight validation
    if (parseFloat(trip.cargoWeight) > parseFloat(vehicle.maxLoadCapacity)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity} kg)`
      });
    }

    // Atomic Updates
    await trip.update({
      status: 'Dispatched',
      startOdometer: vehicle.odometer
    }, { transaction });

    await vehicle.update({ status: 'On Trip' }, { transaction });
    await driver.update({ status: 'On Trip' }, { transaction });

    await transaction.commit();
    return res.json({ message: 'Trip successfully dispatched', trip });
  } catch (error) {
    await transaction.rollback();
    console.error('Dispatch error:', error);
    return res.status(500).json({ message: 'Server error during dispatch execution', error: error.message });
  }
});

// POST complete trip
router.post('/:id/complete', authenticateToken, verifyRole(['Fleet Manager', 'Driver']), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { endOdometer, fuelConsumed, fuelCost } = req.body;

    if (endOdometer === undefined || fuelConsumed === undefined || fuelCost === undefined) {
      await transaction.rollback();
      return res.status(400).json({ message: 'endOdometer, fuelConsumed, and fuelCost are required on completion' });
    }

    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Dispatched') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only Dispatched trips can be completed' });
    }

    // Validation: End odometer must be greater than or equal to start odometer
    if (parseFloat(endOdometer) < parseFloat(trip.startOdometer)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `End odometer (${endOdometer} km) cannot be less than start odometer (${trip.startOdometer} km)`
      });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);

    // Atomic Updates
    await trip.update({
      endOdometer,
      fuelConsumed,
      fuelCost,
      status: 'Completed',
      completionDate: new Date().toISOString().split('T')[0]
    }, { transaction });

    // Update vehicle current odometer to the final trip odometer reading, release status to Available
    await vehicle.update({
      odometer: endOdometer,
      status: 'Available'
    }, { transaction });

    // Release driver status to Available
    await driver.update({ status: 'Available' }, { transaction });

    await transaction.commit();
    return res.json({ message: 'Trip successfully completed', trip });
  } catch (error) {
    await transaction.rollback();
    console.error('Completion error:', error);
    return res.status(500).json({ message: 'Server error during completion execution', error: error.message });
  }
});

// POST cancel trip
router.post('/:id/cancel', authenticateToken, verifyRole(['Fleet Manager', 'Driver']), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Allow cancelling Draft or Dispatched trips
    if (trip.status !== 'Draft' && trip.status !== 'Dispatched') {
      await transaction.rollback();
      return res.status(400).json({ message: `Cannot cancel a trip in state: ${trip.status}` });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);

    await trip.update({ status: 'Cancelled' }, { transaction });

    // If trip was already dispatched, release vehicle and driver to Available
    if (trip.status === 'Dispatched') {
      if (vehicle && vehicle.status === 'On Trip') {
        await vehicle.update({ status: 'Available' }, { transaction });
      }
      if (driver && driver.status === 'On Trip') {
        await driver.update({ status: 'Available' }, { transaction });
      }
    }

    await transaction.commit();
    return res.json({ message: 'Trip successfully cancelled', trip });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancellation error:', error);
    return res.status(500).json({ message: 'Server error during trip cancellation', error: error.message });
  }
});

module.exports = router;
