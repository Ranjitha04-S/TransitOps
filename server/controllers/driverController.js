const { Driver, Trip } = require('../models');
const { Op } = require('sequelize');

exports.getDrivers = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      let drivers = [...mockDb.getDrivers()];

      if (status && status !== 'All') {
        drivers = drivers.filter(d => d.status === status);
      }
      if (search) {
        const query = search.toLowerCase();
        drivers = drivers.filter(d => 
          d.name.toLowerCase().includes(query) ||
          d.licenseNumber.toLowerCase().includes(query) ||
          d.contactNumber.toLowerCase().includes(query)
        );
      }

      const today = new Date().toISOString().split('T')[0];
      drivers = drivers.map(d => ({
        ...d,
        isLicenseExpired: d.licenseExpiryDate < today
      }));

      return res.json({ drivers });
    }

    // Standard SQL Mode
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
    const driverId = parseInt(req.params.id);

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const drivers = mockDb.getDrivers();
      const driver = drivers.find(d => d.id === driverId);

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      const today = new Date().toISOString().split('T')[0];
      const data = { ...driver };
      data.isLicenseExpired = data.licenseExpiryDate < today;

      return res.json({ driver: data });
    }

    // Standard SQL Mode
    const driver = await Driver.findByPk(driverId);
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

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const drivers = mockDb.getDrivers();

      const existing = drivers.find(d => d.licenseNumber === licenseNumber);
      if (existing) {
        return res.status(400).json({ message: 'License number already registered' });
      }

      const driver = {
        id: drivers.length + 1,
        userId: userId || null,
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiryDate,
        contactNumber,
        safetyScore: safetyScore !== undefined ? parseInt(safetyScore) : 100,
        status: status || 'Available',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      drivers.push(driver);

      return res.status(201).json({ message: 'Driver profile created successfully (Mock Mode)', driver });
    }

    // Standard SQL Mode
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
    const driverId = parseInt(req.params.id);

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const drivers = mockDb.getDrivers();
      const trips = mockDb.getTrips();
      const driver = drivers.find(d => d.id === driverId);

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, userId } = req.body;

      if (licenseNumber && licenseNumber !== driver.licenseNumber) {
        const existing = drivers.find(d => d.licenseNumber === licenseNumber);
        if (existing) {
          return res.status(400).json({ message: 'License number already registered' });
        }
      }

      if (status && status !== driver.status) {
        if (driver.status === 'On Trip' && status !== 'On Trip') {
          const activeTrip = trips.find(t => t.driverId === driver.id && t.status === 'Dispatched');
          if (activeTrip) {
            return res.status(400).json({ message: 'Cannot manually change driver status while they are dispatched on an active trip' });
          }
        }
      }

      driver.userId = userId !== undefined ? userId : driver.userId;
      driver.name = name || driver.name;
      driver.licenseNumber = licenseNumber || driver.licenseNumber;
      driver.licenseCategory = licenseCategory || driver.licenseCategory;
      driver.licenseExpiryDate = licenseExpiryDate || driver.licenseExpiryDate;
      driver.contactNumber = contactNumber || driver.contactNumber;
      driver.safetyScore = safetyScore !== undefined ? parseInt(safetyScore) : driver.safetyScore;
      driver.status = status || driver.status;
      driver.updatedAt = new Date();

      return res.json({ message: 'Driver profile updated successfully (Mock Mode)', driver });
    }

    // Standard SQL Mode
    const driver = await Driver.findByPk(driverId);
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
    const driverId = parseInt(req.params.id);

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const drivers = mockDb.getDrivers();
      const trips = mockDb.getTrips();
      const driverIdx = drivers.findIndex(d => d.id === driverId);

      if (driverIdx === -1) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      const driver = drivers[driverIdx];
      if (driver.status === 'On Trip') {
        const activeTrip = trips.find(t => t.driverId === driver.id && t.status === 'Dispatched');
        if (activeTrip) {
          return res.status(400).json({ message: 'Cannot delete driver currently assigned to an active trip' });
        }
      }

      drivers.splice(driverIdx, 1);
      return res.json({ message: 'Driver profile deleted successfully (Mock Mode)' });
    }

    // Standard SQL Mode
    const driver = await Driver.findByPk(driverId);
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
