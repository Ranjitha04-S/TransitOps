const sequelize = require('../config/database');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Trip = require('./Trip');
const MaintenanceLog = require('./MaintenanceLog');
const Expense = require('./Expense');

// Relations
User.hasOne(Driver, { foreignKey: 'userId', as: 'driver' });
Driver.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Vehicle.hasMany(Trip, { foreignKey: 'vehicleId', as: 'trips' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Driver.hasMany(Trip, { foreignKey: 'driverId', as: 'trips' });
Trip.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });

Vehicle.hasMany(MaintenanceLog, { foreignKey: 'vehicleId', as: 'maintenanceLogs' });
MaintenanceLog.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Vehicle.hasMany(Expense, { foreignKey: 'vehicleId', as: 'expenses' });
Expense.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Trip.hasMany(Expense, { foreignKey: 'tripId', as: 'expenses' });
Expense.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  Expense
};
