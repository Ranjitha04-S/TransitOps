const { Vehicle, Trip } = require('../models');
const { Op } = require('sequelize');

exports.getVehicles = async (req, res) => {
  try {
    const { type, status, region, search } = req.query;

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      let vehicles = [...mockDb.getVehicles()];

      if (type && type !== 'All') {
        vehicles = vehicles.filter(v => v.type === type);
      }
      if (status && status !== 'All') {
        vehicles = vehicles.filter(v => v.status === status);
      }
      if (region && region !== 'All') {
        vehicles = vehicles.filter(v => v.region === region);
      }
      if (search) {
        const query = search.toLowerCase();
        vehicles = vehicles.filter(v => 
          v.registrationNumber.toLowerCase().includes(query) ||
          v.name.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query)
        );
      }

      return res.json({ vehicles });
    }

    // Standard SQL Mode
    const whereClause = {};
    if (type && type !== 'All') whereClause.type = type;
    if (status && status !== 'All') whereClause.status = status;
    if (region && region !== 'All') whereClause.region = region;
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
};

exports.getVehicleById = async (req, res) => {
  try {
    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const vehicles = mockDb.getVehicles();
      const vehicle = vehicles.find(v => v.id === parseInt(req.params.id));
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      return res.json({ vehicle });
    }

    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    return res.json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return res.status(500).json({ message: 'Server error fetching vehicle', error: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const { registrationNumber, name, model, type, region, maxLoadCapacity, odometer, acquisitionCost } = req.body;

    if (!registrationNumber || !name || !model || !type || !region || !maxLoadCapacity || !acquisitionCost) {
      return res.status(400).json({ message: 'All fields except odometer are required' });
    }

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const vehicles = mockDb.getVehicles();

      const existing = vehicles.find(v => v.registrationNumber === registrationNumber);
      if (existing) {
        return res.status(400).json({ message: 'Registration number already exists' });
      }

      const vehicle = {
        id: vehicles.length + 1,
        registrationNumber,
        name,
        model,
        type,
        region,
        maxLoadCapacity: parseFloat(maxLoadCapacity),
        odometer: parseFloat(odometer || 0.00),
        acquisitionCost: parseFloat(acquisitionCost),
        status: 'Available',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      vehicles.push(vehicle);

      return res.status(201).json({ message: 'Vehicle created successfully (Mock Mode)', vehicle });
    }

    // Standard SQL Mode
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
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const vehicles = mockDb.getVehicles();
      const trips = mockDb.getTrips();
      const vehicle = vehicles.find(v => v.id === vehicleId);

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      const { registrationNumber, name, model, type, region, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;

      if (registrationNumber && registrationNumber !== vehicle.registrationNumber) {
        const existing = vehicles.find(v => v.registrationNumber === registrationNumber);
        if (existing) {
          return res.status(400).json({ message: 'Registration number already exists' });
        }
      }

      if (status && status !== vehicle.status) {
        if (vehicle.status === 'On Trip' && status !== 'On Trip') {
          const activeTrip = trips.find(t => t.vehicleId === vehicle.id && t.status === 'Dispatched');
          if (activeTrip) {
            return res.status(400).json({ message: 'Cannot change vehicle status while it is currently dispatched on an active trip' });
          }
        }
      }

      vehicle.registrationNumber = registrationNumber || vehicle.registrationNumber;
      vehicle.name = name || vehicle.name;
      vehicle.model = model || vehicle.model;
      vehicle.type = type || vehicle.type;
      vehicle.region = region || vehicle.region;
      vehicle.maxLoadCapacity = maxLoadCapacity !== undefined ? parseFloat(maxLoadCapacity) : vehicle.maxLoadCapacity;
      vehicle.odometer = odometer !== undefined ? parseFloat(odometer) : vehicle.odometer;
      vehicle.acquisitionCost = acquisitionCost !== undefined ? parseFloat(acquisitionCost) : vehicle.acquisitionCost;
      vehicle.status = status || vehicle.status;
      vehicle.updatedAt = new Date();

      return res.json({ message: 'Vehicle updated successfully (Mock Mode)', vehicle });
    }

    // Standard SQL Mode
    const vehicle = await Vehicle.findByPk(vehicleId);
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

    if (status && status !== vehicle.status) {
      if (vehicle.status === 'On Trip' && status !== 'On Trip') {
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
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const vehicles = mockDb.getVehicles();
      const trips = mockDb.getTrips();
      const vehicleIdx = vehicles.findIndex(v => v.id === vehicleId);

      if (vehicleIdx === -1) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      const vehicle = vehicles[vehicleIdx];
      if (vehicle.status === 'On Trip') {
        const activeTrip = trips.find(t => t.vehicleId === vehicle.id && t.status === 'Dispatched');
        if (activeTrip) {
          return res.status(400).json({ message: 'Cannot delete vehicle currently deployed on an active trip' });
        }
      }

      vehicles.splice(vehicleIdx, 1);
      return res.json({ message: 'Vehicle deleted successfully (Mock Mode)' });
    }

    // Standard SQL Mode
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

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
};
