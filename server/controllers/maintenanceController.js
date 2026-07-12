const { MaintenanceLog, Vehicle, sequelize } = require('../models');

exports.getMaintenanceLogs = async (req, res) => {
  try {
    const { status, vehicleId } = req.query;

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      let logs = [...mockDb.getMaintenanceLogs()];
      const vehicles = mockDb.getVehicles();

      if (status) logs = logs.filter(l => l.status === status);
      if (vehicleId) logs = logs.filter(l => l.vehicleId === parseInt(vehicleId));

      const populatedLogs = logs.map(l => {
        const log = { ...l };
        const v = vehicles.find(veh => veh.id === log.vehicleId);
        log.vehicle = v ? { registrationNumber: v.registrationNumber, name: v.name, model: v.model, type: v.type } : null;
        return log;
      });

      return res.json({ logs: populatedLogs });
    }

    // Standard SQL Mode
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
};

exports.createMaintenanceLog = async (req, res) => {
  try {
    const { vehicleId, description, cost, startDate } = req.body;

    if (!vehicleId || !description || cost === undefined || !startDate) {
      return res.status(400).json({ message: 'vehicleId, description, cost, and startDate are required' });
    }

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const logs = mockDb.getMaintenanceLogs();
      const vehicles = mockDb.getVehicles();
      const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      if (vehicle.status === 'On Trip') {
        return res.status(400).json({ message: 'Cannot place vehicle in maintenance while it is currently deployed on an active trip' });
      }

      const log = {
        id: logs.length + 1,
        vehicleId: parseInt(vehicleId),
        description,
        cost: parseFloat(cost),
        startDate,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      logs.push(log);

      vehicle.status = 'In Shop';

      return res.status(201).json({ message: 'Maintenance record created and vehicle status set to In Shop (Mock Mode)', log });
    }

    // Standard SQL Mode
    const transaction = await sequelize.transaction();
    try {
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      if (vehicle.status === 'On Trip') {
        await transaction.rollback();
        return res.status(400).json({ message: 'Cannot place vehicle in maintenance while it is currently deployed on an active trip' });
      }

      const log = await MaintenanceLog.create({
        vehicleId,
        description,
        cost,
        startDate,
        status: 'Active'
      }, { transaction });

      await vehicle.update({ status: 'In Shop' }, { transaction });

      await transaction.commit();
      return res.status(201).json({ message: 'Maintenance record created and vehicle status set to In Shop', log });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Create maintenance error:', error);
    return res.status(500).json({ message: 'Server error creating maintenance entry', error: error.message });
  }
};

exports.closeMaintenanceLog = async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    const { endDate } = req.body;

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const logs = mockDb.getMaintenanceLogs();
      const vehicles = mockDb.getVehicles();
      const log = logs.find(l => l.id === logId);

      if (!log) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }

      if (log.status === 'Closed') {
        return res.status(400).json({ message: 'Maintenance log is already closed' });
      }

      const finalEndDate = endDate || new Date().toISOString().split('T')[0];

      if (finalEndDate < log.startDate) {
        return res.status(400).json({ message: `End date (${finalEndDate}) cannot be before start date (${log.startDate})` });
      }

      const vehicle = vehicles.find(v => v.id === log.vehicleId);

      log.endDate = finalEndDate;
      log.status = 'Closed';

      if (vehicle && vehicle.status === 'In Shop') {
        vehicle.status = 'Available';
      }

      return res.json({ message: 'Maintenance record closed and vehicle returned to Available status (Mock Mode)', log });
    }

    // Standard SQL Mode
    const transaction = await sequelize.transaction();
    try {
      const log = await MaintenanceLog.findByPk(logId);

      if (!log) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Maintenance record not found' });
      }

      if (log.status === 'Closed') {
        await transaction.rollback();
        return res.status(400).json({ message: 'Maintenance log is already closed' });
      }

      const finalEndDate = endDate || new Date().toISOString().split('T')[0];

      if (finalEndDate < log.startDate) {
        await transaction.rollback();
        return res.status(400).json({ message: `End date (${finalEndDate}) cannot be before start date (${log.startDate})` });
      }

      const vehicle = await Vehicle.findByPk(log.vehicleId);

      await log.update({
        endDate: finalEndDate,
        status: 'Closed'
      }, { transaction });

      if (vehicle && vehicle.status === 'In Shop') {
        await vehicle.update({ status: 'Available' }, { transaction });
      }

      await transaction.commit();
      return res.json({ message: 'Maintenance record closed and vehicle returned to Available status', log });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Close maintenance error:', error);
    return res.status(500).json({ message: 'Server error closing maintenance entry', error: error.message });
  }
};
