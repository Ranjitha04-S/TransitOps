const { Trip, Vehicle, Driver, sequelize } = require('../models');

exports.getTrips = async (req, res) => {
  try {
    const { status, vehicleId, driverId } = req.query;

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      let trips = [...mockDb.getTrips()];
      const vehicles = mockDb.getVehicles();
      const drivers = mockDb.getDrivers();

      if (status) trips = trips.filter(t => t.status === status);
      if (vehicleId) trips = trips.filter(t => t.vehicleId === parseInt(vehicleId));
      if (driverId) trips = trips.filter(t => t.driverId === parseInt(driverId));

      const populatedTrips = trips.map(t => {
        const trip = { ...t };
        const v = vehicles.find(veh => veh.id === trip.vehicleId);
        const d = drivers.find(drv => drv.id === trip.driverId);

        trip.vehicle = v ? { registrationNumber: v.registrationNumber, name: v.name, model: v.model, type: v.type } : null;
        trip.driver = d ? { name: d.name, licenseNumber: d.licenseNumber, status: d.status } : null;
        return trip;
      });

      return res.json({ trips: populatedTrips });
    }

    // Standard SQL Mode
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
};

exports.getTripById = async (req, res) => {
  try {
    const tripId = parseInt(req.params.id);

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const trips = mockDb.getTrips();
      const vehicles = mockDb.getVehicles();
      const drivers = mockDb.getDrivers();
      const tripRaw = trips.find(t => t.id === tripId);

      if (!tripRaw) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      const trip = { ...tripRaw };
      trip.vehicle = vehicles.find(v => v.id === trip.vehicleId) || null;
      trip.driver = drivers.find(d => d.id === trip.driverId) || null;

      return res.json({ trip });
    }

    // Standard SQL Mode
    const trip = await Trip.findByPk(tripId, {
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
};

exports.createTripDraft = async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue } = req.body;

    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance || !revenue) {
      return res.status(400).json({ message: 'All fields are required to draft a trip' });
    }

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const trips = mockDb.getTrips();

      const trip = {
        id: trips.length + 1,
        source,
        destination,
        vehicleId: parseInt(vehicleId),
        driverId: parseInt(driverId),
        cargoWeight: parseFloat(cargoWeight),
        plannedDistance: parseFloat(plannedDistance),
        revenue: parseFloat(revenue),
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      trips.push(trip);

      return res.status(201).json({ message: 'Trip draft created successfully (Mock Mode)', trip });
    }

    // Standard SQL Mode
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
};

exports.dispatchTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);

  if (global.isMockMode) {
    const mockDb = require('../config/mockDb');
    const trips = mockDb.getTrips();
    const vehicles = mockDb.getVehicles();
    const drivers = mockDb.getDrivers();
    const trip = trips.find(t => t.id === tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Draft') {
      return res.status(400).json({ message: 'Only Draft trips can be dispatched' });
    }

    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.id === trip.driverId);

    if (!vehicle || !driver) {
      return res.status(400).json({ message: 'Assigned vehicle or driver does not exist' });
    }

    if (vehicle.status !== 'Available') {
      return res.status(400).json({ message: `Vehicle is unavailable (Current status: ${vehicle.status})` });
    }

    if (driver.status !== 'Available') {
      return res.status(400).json({ message: `Driver is unavailable (Current status: ${driver.status})` });
    }

    const today = new Date().toISOString().split('T')[0];
    if (driver.licenseExpiryDate < today) {
      return res.status(400).json({ message: `Driver license is expired (Expiry Date: ${driver.licenseExpiryDate})` });
    }

    if (parseFloat(trip.cargoWeight) > parseFloat(vehicle.maxLoadCapacity)) {
      return res.status(400).json({
        message: `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity} kg)`
      });
    }

    // Atomic mock update
    trip.status = 'Dispatched';
    trip.startOdometer = vehicle.odometer;
    vehicle.status = 'On Trip';
    driver.status = 'On Trip';

    return res.json({ message: 'Trip successfully dispatched (Mock Mode)', trip });
  }

  // Standard SQL Mode
  const transaction = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(tripId);
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

    if (vehicle.status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({ message: `Vehicle is unavailable (Current status: ${vehicle.status})` });
    }

    if (driver.status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({ message: `Driver is unavailable (Current status: ${driver.status})` });
    }

    const today = new Date().toISOString().split('T')[0];
    if (driver.licenseExpiryDate < today) {
      await transaction.rollback();
      return res.status(400).json({ message: `Driver license is expired (Expiry Date: ${driver.licenseExpiryDate})` });
    }

    if (parseFloat(trip.cargoWeight) > parseFloat(vehicle.maxLoadCapacity)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity} kg)`
      });
    }

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
};

exports.completeTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);

  if (global.isMockMode) {
    const { endOdometer, fuelConsumed, fuelCost } = req.body;

    if (endOdometer === undefined || fuelConsumed === undefined || fuelCost === undefined) {
      return res.status(400).json({ message: 'endOdometer, fuelConsumed, and fuelCost are required on completion' });
    }

    const mockDb = require('../config/mockDb');
    const trips = mockDb.getTrips();
    const vehicles = mockDb.getVehicles();
    const drivers = mockDb.getDrivers();
    const trip = trips.find(t => t.id === tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only Dispatched trips can be completed' });
    }

    if (parseFloat(endOdometer) < parseFloat(trip.startOdometer)) {
      return res.status(400).json({
        message: `End odometer (${endOdometer} km) cannot be less than start odometer (${trip.startOdometer} km)`
      });
    }

    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.id === trip.driverId);

    // Mock completion updates
    trip.endOdometer = parseFloat(endOdometer);
    trip.fuelConsumed = parseFloat(fuelConsumed);
    trip.fuelCost = parseFloat(fuelCost);
    trip.status = 'Completed';
    trip.completionDate = new Date().toISOString().split('T')[0];

    if (vehicle) {
      vehicle.odometer = parseFloat(endOdometer);
      vehicle.status = 'Available';
    }
    if (driver) {
      driver.status = 'Available';
    }

    return res.json({ message: 'Trip successfully completed (Mock Mode)', trip });
  }

  // Standard SQL Mode
  const transaction = await sequelize.transaction();
  try {
    const { endOdometer, fuelConsumed, fuelCost } = req.body;

    if (endOdometer === undefined || fuelConsumed === undefined || fuelCost === undefined) {
      await transaction.rollback();
      return res.status(400).json({ message: 'endOdometer, fuelConsumed, and fuelCost are required on completion' });
    }

    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Dispatched') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only Dispatched trips can be completed' });
    }

    if (parseFloat(endOdometer) < parseFloat(trip.startOdometer)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `End odometer (${endOdometer} km) cannot be less than start odometer (${trip.startOdometer} km)`
      });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);

    await trip.update({
      endOdometer,
      fuelConsumed,
      fuelCost,
      status: 'Completed',
      completionDate: new Date().toISOString().split('T')[0]
    }, { transaction });

    await vehicle.update({
      odometer: endOdometer,
      status: 'Available'
    }, { transaction });

    await driver.update({ status: 'Available' }, { transaction });

    await transaction.commit();
    return res.json({ message: 'Trip successfully completed', trip });
  } catch (error) {
    await transaction.rollback();
    console.error('Completion error:', error);
    return res.status(500).json({ message: 'Server error during completion execution', error: error.message });
  }
};

exports.cancelTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);

  if (global.isMockMode) {
    const mockDb = require('../config/mockDb');
    const trips = mockDb.getTrips();
    const vehicles = mockDb.getVehicles();
    const drivers = mockDb.getDrivers();
    const trip = trips.find(t => t.id === tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Draft' && trip.status !== 'Dispatched') {
      return res.status(400).json({ message: `Cannot cancel a trip in state: ${trip.status}` });
    }

    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.id === trip.driverId);

    const oldStatus = trip.status;
    trip.status = 'Cancelled';

    if (oldStatus === 'Dispatched') {
      if (vehicle && vehicle.status === 'On Trip') vehicle.status = 'Available';
      if (driver && driver.status === 'On Trip') driver.status = 'Available';
    }

    return res.json({ message: 'Trip successfully cancelled (Mock Mode)', trip });
  }

  // Standard SQL Mode
  const transaction = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Draft' && trip.status !== 'Dispatched') {
      await transaction.rollback();
      return res.status(400).json({ message: `Cannot cancel a trip in state: ${trip.status}` });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);

    const oldStatus = trip.status;
    await trip.update({ status: 'Cancelled' }, { transaction });

    if (oldStatus === 'Dispatched') {
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
};
