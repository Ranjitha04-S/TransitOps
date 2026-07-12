const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vehicles',
      key: 'id'
    }
  },
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Trips',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('Toll', 'Other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
});

module.exports = Expense;
