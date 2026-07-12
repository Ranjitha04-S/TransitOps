const { Driver, Trip } = require('../models');
const { Op } = require('sequelize');

exports.getDrivers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const whereClause = {};

    if (status && status !== 'All') {
      whereClause.status = status;
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { licenseNumber: { [Op.like]: `%${search}%` } },
        { contactNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    const driversRaw = await Driver.findAll({ where: whereClause });
    const today = new Date().toISOString().split('T')[0];

    const drivers = driversRaw.map(d => {
      const data = d.toJSON();
      data.isLicenseExpired = data.licenseExpiryDate < today;
      return data;
    });

    return res.json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return res.status(500).json({ message: 'Server error fetching drivers', error: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const data = driver.toJSON();
    data.isLicenseExpired = data.licenseExpiryDate < today;

    return res.json({ driver: data });
  } catch (error) {
    console.error('Error fetching driver:', error);
    return res.status(500).json({ message: 'Server error fetching driver', error: error.message });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, userId } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      return res.status(400).json({ message: 'Name, license details, expiry, and contact number are required' });
    }

    const existing = await Driver.findOne({ where: { licenseNumber } });
    if (existing) {
      return res.status(400).json({ message: 'License number already registered' });
    }

    const driver = await Driver.create({
      userId: userId || null,
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: safetyScore !== undefined ? safetyScore : 100,
      status: status || 'Available'
    });

    return res.status(201).json({ message: 'Driver profile created successfully', driver });
  } catch (error) {
    console.error('Error creating driver:', error);
    return res.status(500).json({ message: 'Server error creating driver', error: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, userId } = req.body;

    if (licenseNumber && licenseNumber !== driver.licenseNumber) {
      const existing = await Driver.findOne({ where: { licenseNumber } });
      if (existing) {
        return res.status(400).json({ message: 'License number already registered' });
      }
    }

    if (status && status !== driver.status) {
      if (driver.status === 'On Trip' && status !== 'On Trip') {
        const activeTrip = await Trip.findOne({ where: { driverId: driver.id, status: 'Dispatched' } });
        if (activeTrip) {
          return res.status(400).json({ message: 'Cannot manually change driver status while they are dispatched on an active trip' });
        }
      }
    }

    await driver.update({
      userId: userId !== undefined ? userId : driver.userId,
      name: name || driver.name,
      licenseNumber: licenseNumber || driver.licenseNumber,
      licenseCategory: licenseCategory || driver.licenseCategory,
      licenseExpiryDate: licenseExpiryDate || driver.licenseExpiryDate,
      contactNumber: contactNumber || driver.contactNumber,
      safetyScore: safetyScore !== undefined ? safetyScore : driver.safetyScore,
      status: status || driver.status
    });

    return res.json({ message: 'Driver profile updated successfully', driver });
  } catch (error) {
    console.error('Error updating driver:', error);
    return res.status(500).json({ message: 'Server error updating driver', error: error.message });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (driver.status === 'On Trip') {
      const activeTrip = await Trip.findOne({ where: { driverId: driver.id, status: 'Dispatched' } });
      if (activeTrip) {
        return res.status(400).json({ message: 'Cannot delete driver currently assigned to an active trip' });
      }
    }

    await driver.destroy();
    return res.json({ message: 'Driver profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return res.status(500).json({ message: 'Server error deleting driver', error: error.message });
  }
};
