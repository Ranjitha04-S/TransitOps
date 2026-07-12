const { Vehicle, Driver, Trip, MaintenanceLog, Expense } = require('../models');
const sequelize = require('../config/database');

exports.getKPIs = async (req, res) => {
  try {
    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const vehicles = mockDb.getVehicles();
      const drivers = mockDb.getDrivers();
      const trips = mockDb.getTrips();

      const totalVehicles = vehicles.filter(v => v.status !== 'Retired').length;
      const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
      const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
      const vehiclesInMaintenance = vehicles.filter(v => v.status === 'In Shop').length;

      const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
      const pendingTrips = trips.filter(t => t.status === 'Draft').length;
      const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length;

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
    }

    // Standard SQL Mode
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
    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const vehicles = mockDb.getVehicles().filter(v => v.status !== 'Retired');
      const trips = mockDb.getTrips();
      const logs = mockDb.getMaintenanceLogs();
      const expensesList = mockDb.getExpenses();

      const analytics = [];

      for (const vehicle of vehicles) {
        // Completed trips metrics
        const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === 'Completed');
        let totalRevenue = 0;
        let totalFuelCost = 0;
        let totalFuelConsumed = 0;
        let totalDistance = 0;

        vehicleTrips.forEach(t => {
          totalRevenue += parseFloat(t.revenue || 0);
          totalFuelCost += parseFloat(t.fuelCost || 0);
          totalFuelConsumed += parseFloat(t.fuelConsumed || 0);
          const dist = parseFloat(t.endOdometer || 0) - parseFloat(t.startOdometer || 0);
          totalDistance += dist > 0 ? dist : 0;
        });

        // Maintenance costs
        const vehicleLogs = logs.filter(l => l.vehicleId === vehicle.id);
        let totalMaintenanceCost = 0;
        vehicleLogs.forEach(l => {
          totalMaintenanceCost += parseFloat(l.cost || 0);
        });

        // Miscellaneous expenses (Tolls, etc.)
        const vehicleExpenses = expensesList.filter(e => e.vehicleId === vehicle.id);
        let totalTollsAndOther = 0;
        vehicleExpenses.forEach(e => {
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
    }

    // Standard SQL Mode
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

// POST simulate random completed trips for evaluation
exports.simulateTrips = async (req, res) => {
  try {
    const totalSimulatedTrips = 15;
    const cities = ['Boston', 'New York', 'Philadelphia', 'Baltimore', 'Washington', 'Richmond', 'Charlotte', 'Atlanta', 'Orlando', 'Miami'];

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const vehicles = mockDb.getVehicles().filter(v => v.status !== 'Retired');
      const drivers = mockDb.getDrivers().filter(d => d.status !== 'Suspended');
      const trips = mockDb.getTrips();
      const expensesList = mockDb.getExpenses();

      if (vehicles.length === 0 || drivers.length === 0) {
        return res.status(400).json({ message: 'Vehicles or Drivers empty. Please seed first.' });
      }

      for (let i = 0; i < totalSimulatedTrips; i++) {
        const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
        const driver = drivers[Math.floor(Math.random() * drivers.length)];

        const distance = Math.floor(Math.random() * 450) + 50; // 50 to 500 km
        const startOdometer = parseFloat(vehicle.odometer);
        const endOdometer = startOdometer + distance;
        
        const efficiency = Math.floor(Math.random() * 7) + 3; // 3 to 10 km/L
        const fuelConsumed = parseFloat((distance / efficiency).toFixed(2));
        const fuelCost = parseFloat((fuelConsumed * 92.50).toFixed(2)); // Fuel cost around INR 92.5
        const tariff = Math.floor(Math.random() * 100) + 40; // Tariff INR 40 - 140 per km
        const revenue = parseFloat((distance * tariff).toFixed(2));

        const source = cities[Math.floor(Math.random() * cities.length)];
        let destination = cities[Math.floor(Math.random() * cities.length)];
        while (destination === source) {
          destination = cities[Math.floor(Math.random() * cities.length)];
        }

        // Subtract random days for timeline distribution
        const randomDaysAgo = Math.floor(Math.random() * 28) + 1;
        const d = new Date();
        d.setDate(d.getDate() - randomDaysAgo);
        const completionDate = d.toISOString().split('T')[0];

        // Insert trip in mock memory
        const trip = {
          id: trips.length + 1,
          source,
          destination,
          vehicleId: vehicle.id,
          driverId: driver.id,
          cargoWeight: Math.floor(Math.random() * 4000) + 200,
          plannedDistance: distance,
          startOdometer,
          endOdometer,
          status: 'Completed',
          fuelConsumed,
          fuelCost,
          revenue,
          completionDate,
          createdAt: d,
          updatedAt: d
        };
        trips.push(trip);

        // Update vehicle odometer
        vehicle.odometer = endOdometer;

        // 30% chance to generate a toll expense
        if (Math.random() < 0.30) {
          expensesList.push({
            id: expensesList.length + 1,
            vehicleId: vehicle.id,
            tripId: trip.id,
            type: 'Toll',
            amount: parseFloat((Math.random() * 600 + 100).toFixed(2)),
            date: completionDate,
            createdAt: d,
            updatedAt: d
          });
        }
      }

      return res.json({ message: `Successfully simulated ${totalSimulatedTrips} completed trips in Mock Mode!` });
    }

    // Standard SQL Mode
    const vehicles = await Vehicle.findAll({ where: { status: { [sequelize.Sequelize.Op.ne]: 'Retired' } } });
    const drivers = await Driver.findAll({ where: { status: { [sequelize.Sequelize.Op.ne]: 'Suspended' } } });

    if (vehicles.length === 0 || drivers.length === 0) {
      return res.status(400).json({ message: 'Vehicles or Drivers empty. Please seed first.' });
    }

    for (let i = 0; i < totalSimulatedTrips; i++) {
      const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
      const driver = drivers[Math.floor(Math.random() * drivers.length)];

      const distance = Math.floor(Math.random() * 450) + 50;
      const startOdometer = parseFloat(vehicle.odometer);
      const endOdometer = startOdometer + distance;
      
      const efficiency = Math.floor(Math.random() * 7) + 3;
      const fuelConsumed = parseFloat((distance / efficiency).toFixed(2));
      const fuelCost = parseFloat((fuelConsumed * 92.50).toFixed(2));
      const tariff = Math.floor(Math.random() * 100) + 40;
      const revenue = parseFloat((distance * tariff).toFixed(2));

      const source = cities[Math.floor(Math.random() * cities.length)];
      let destination = cities[Math.floor(Math.random() * cities.length)];
      while (destination === source) {
        destination = cities[Math.floor(Math.random() * cities.length)];
      }

      const randomDaysAgo = Math.floor(Math.random() * 28) + 1;
      const d = new Date();
      d.setDate(d.getDate() - randomDaysAgo);
      const completionDate = d.toISOString().split('T')[0];

      const transaction = await sequelize.transaction();
      try {
        const trip = await Trip.create({
          source,
          destination,
          vehicleId: vehicle.id,
          driverId: driver.id,
          cargoWeight: Math.floor(Math.random() * 4000) + 200,
          plannedDistance: distance,
          startOdometer,
          endOdometer,
          status: 'Completed',
          fuelConsumed,
          fuelCost,
          revenue,
          completionDate,
          createdAt: d,
          updatedAt: d
        }, { transaction });

        await vehicle.update({ odometer: endOdometer }, { transaction });

        if (Math.random() < 0.30) {
          await Expense.create({
            vehicleId: vehicle.id,
            tripId: trip.id,
            type: 'Toll',
            amount: parseFloat((Math.random() * 600 + 100).toFixed(2)),
            date: completionDate,
            createdAt: d,
            updatedAt: d
          }, { transaction });
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    return res.json({ message: `Successfully simulated ${totalSimulatedTrips} completed trips in standard SQL mode!` });
  } catch (error) {
    console.error('Simulation error:', error);
    return res.status(500).json({ message: 'Server error generating simulation data', error: error.message });
  }
};
