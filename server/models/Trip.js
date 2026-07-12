const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trip = sequelize.define('Trip', {
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vehicles',
      key: 'id'
    }
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Drivers',
      key: 'id'
    }
  },
  cargoWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  plannedDistance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  startOdometer: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  endOdometer: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Draft'
  },
  fuelConsumed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  fuelCost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  revenue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  completionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
});

module.exports = Trip;
