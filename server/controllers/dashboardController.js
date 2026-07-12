const { Vehicle, Driver, Trip, MaintenanceLog, Expense } = require('../models');
const sequelize = require('../config/database');

exports.getKPIs = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.count({ where: { status: { [sequelize.Sequelize.Op.ne]: 'Retired' } } });
    const activeVehicles = await Vehicle.count({ where: { status: 'On Trip' } });
    const availableVehicles = await Vehicle.count({ where: { status: 'Available' } });
    const vehiclesInMaintenance = await Vehicle.count({ where: { status: 'In Shop' } });

    const activeTrips = await Trip.count({ where: { status: 'Dispatched' } });
    const pendingTrips = await Trip.count({ where: { status: 'Draft' } });
    const driversOnDuty = await Driver.count({ where: { status: 'On Trip' } });

    const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    return res.json({
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return res.status(500).json({ message: 'Server error fetching KPIs', error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: { status: { [sequelize.Sequelize.Op.ne]: 'Retired' } }
    });

    const analytics = [];

    for (const vehicle of vehicles) {
      const tripsData = await Trip.findAll({
        where: { vehicleId: vehicle.id, status: 'Completed' }
      });

      let totalRevenue = 0;
      let totalFuelCost = 0;
      let totalFuelConsumed = 0;
      let totalDistance = 0;

      tripsData.forEach(t => {
        totalRevenue += parseFloat(t.revenue || 0);
        totalFuelCost += parseFloat(t.fuelCost || 0);
        totalFuelConsumed += parseFloat(t.fuelConsumed || 0);
        
        const dist = parseFloat(t.endOdometer || 0) - parseFloat(t.startOdometer || 0);
        totalDistance += dist > 0 ? dist : 0;
      });

      const maintenanceData = await MaintenanceLog.findAll({
        where: { vehicleId: vehicle.id }
      });
      let totalMaintenanceCost = 0;
      maintenanceData.forEach(m => {
        totalMaintenanceCost += parseFloat(m.cost || 0);
      });

      const expenseData = await Expense.findAll({
        where: { vehicleId: vehicle.id }
      });
      let totalTollsAndOther = 0;
      expenseData.forEach(e => {
        totalTollsAndOther += parseFloat(e.amount || 0);
      });

      const totalExpenses = totalFuelCost + totalMaintenanceCost + totalTollsAndOther;
      const netProfit = totalRevenue - totalExpenses;
      const acqCost = parseFloat(vehicle.acquisitionCost || 0);
      
      const roi = acqCost > 0 ? (netProfit / acqCost) * 100 : 0;
      const fuelEfficiency = totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed) : 0;

      analytics.push({
        id: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        acquisitionCost: acqCost,
        totalRevenue,
        totalExpenses,
        netProfit,
        roi: parseFloat(roi.toFixed(2)),
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        totalFuelConsumed: parseFloat(totalFuelConsumed.toFixed(2)),
        fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2))
      });
    }

    return res.json({ analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ message: 'Server error fetching analytics', error: error.message });
  }
};
