const { Vehicle, Trip } = require('../models');
const { Op } = require('sequelize');

exports.getVehicles = async (req, res) => {
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
};

exports.getVehicleById = async (req, res) => {
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
};

exports.createVehicle = async (req, res) => {
  try {
    const { registrationNumber, name, model, type, region, maxLoadCapacity, odometer, acquisitionCost } = req.body;

    if (!registrationNumber || !name || !model || !type || !region || !maxLoadCapacity || !acquisitionCost) {
      return res.status(400).json({ message: 'All fields except odometer are required' });
    }

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
    const vehicle = await Vehicle.findByPk(req.params.id);
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
