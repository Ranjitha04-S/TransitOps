const bcrypt = require('bcryptjs');
const { sequelize, User, Vehicle, Driver, Trip, MaintenanceLog, Expense } = require('./models');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Force sync the database (clears existing data and recreates tables)
    await sequelize.sync({ force: true });
    console.log('Database tables cleared and recreated.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.bulkCreate([
      { email: 'manager@transitops.com', password: hashedPassword, role: 'Fleet Manager' },
      { email: 'driver@transitops.com', password: hashedPassword, role: 'Driver' },
      { email: 'safety@transitops.com', password: hashedPassword, role: 'Safety Officer' },
      { email: 'finance@transitops.com', password: hashedPassword, role: 'Financial Analyst' }
    ]);
    console.log('Inserted default users.');

    const managerUser = users.find(u => u.email === 'manager@transitops.com');
    const driverUser = users.find(u => u.email === 'driver@transitops.com');

    // 2. Create Drivers
    const drivers = await Driver.bulkCreate([
      {
        userId: driverUser.id,
        name: 'John Doe',
        licenseNumber: 'DL-552912400',
        licenseCategory: 'Commercial Heavy',
        licenseExpiryDate: '2028-12-31',
        contactNumber: '+919999988888',
        safetyScore: 95,
        status: 'Available'
      },
      {
        userId: null,
        name: 'Sarah Connor',
        licenseNumber: 'DL-882918800',
        licenseCategory: 'Commercial Heavy',
        licenseExpiryDate: '2027-05-15',
        contactNumber: '+918888877777',
        safetyScore: 92,
        status: 'On Trip'
      },
      {
        userId: null,
        name: 'Bob Jenkins (Expired)',
        licenseNumber: 'DL-EXPIRED-99',
        licenseCategory: 'Commercial Light',
        licenseExpiryDate: '2025-01-01', // Expired
        contactNumber: '+917777766666',
        safetyScore: 78,
        status: 'Available'
      }
    ]);
    console.log('Inserted driver profiles.');

    const johnDriver = drivers.find(d => d.name === 'John Doe');
    const sarahDriver = drivers.find(d => d.name === 'Sarah Connor');

    // 3. Create Vehicles
    const vehicles = await Vehicle.bulkCreate([
      {
        registrationNumber: 'MH-12-TR-9981',
        name: 'Volvo FMX',
        model: 'FMX Tip-Truck',
        type: 'Truck',
        region: 'North',
        maxLoadCapacity: 15000.00,
        odometer: 45200.50,
        acquisitionCost: 4500000.00,
        status: 'Available'
      },
      {
        registrationNumber: 'MH-12-TR-9982',
        name: 'BharatBenz 2823C',
        model: '2823C Dump Truck',
        type: 'Truck',
        region: 'South',
        maxLoadCapacity: 10000.00,
        odometer: 18400.00,
        acquisitionCost: 3200000.00,
        status: 'On Trip'
      },
      {
        registrationNumber: 'DL-01-VN-4412',
        name: 'Tata Winger',
        model: 'Winger Cargo Van',
        type: 'Van',
        region: 'East',
        maxLoadCapacity: 1500.00,
        odometer: 8210.00,
        acquisitionCost: 1200000.00,
        status: 'In Shop'
      },
      {
        registrationNumber: 'KA-03-CR-2210',
        name: 'Maruti Suzuki Eeco',
        model: 'Eeco Cargo Car',
        type: 'Car',
        region: 'West',
        maxLoadCapacity: 600.00,
        odometer: 3500.00,
        acquisitionCost: 600000.00,
        status: 'Available'
      }
    ]);
    console.log('Inserted vehicle registry assets.');

    const volvoVehicle = vehicles.find(v => v.name === 'Volvo FMX');
    const benzVehicle = vehicles.find(v => v.name === 'BharatBenz 2823C');
    const wingerVehicle = vehicles.find(v => v.name === 'Tata Winger');
    const eecoVehicle = vehicles.find(v => v.name === 'Maruti Suzuki Eeco');

    // 4. Create Trips
    // Trip 1: Completed (shows ROI and distance analytics)
    const tripCompleted = await Trip.create({
      source: 'Chennai Port',
      destination: 'Bangalore Depot',
      vehicleId: volvoVehicle.id,
      driverId: johnDriver.id,
      cargoWeight: 12000.00,
      plannedDistance: 350.00,
      startOdometer: 44850.00,
      endOdometer: 45200.50, // Actual travel = 350.5 km
      status: 'Completed',
      fuelConsumed: 110.00, // fuel efficiency = 350.5 / 110 = 3.19 km/L
      fuelCost: 9900.00,
      revenue: 85000.00,
      completionDate: '2026-07-10'
    });

    // Trip 2: Active / Dispatched (to test active filters)
    const tripDispatched = await Trip.create({
      source: 'Mumbai Hub',
      destination: 'Pune Warehouse',
      vehicleId: benzVehicle.id,
      driverId: sarahDriver.id,
      cargoWeight: 8500.00,
      plannedDistance: 150.00,
      startOdometer: 18250.00,
      status: 'Dispatched',
      revenue: 35000.00
    });

    // Trip 3: Draft (to test dispatch updates)
    const tripDraft = await Trip.create({
      source: 'Delhi Depot',
      destination: 'Noida Store',
      vehicleId: eecoVehicle.id,
      driverId: johnDriver.id,
      cargoWeight: 400.00,
      plannedDistance: 45.00,
      status: 'Draft',
      revenue: 5000.00
    });
    console.log('Inserted trip records.');

    // 5. Create Maintenance Logs
    // Log 1: Closed log on Volvo
    await MaintenanceLog.create({
      vehicleId: volvoVehicle.id,
      description: 'Wheel Alignment & Tire Rotation',
      cost: 15000.00,
      startDate: '2026-07-01',
      endDate: '2026-07-02',
      status: 'Closed'
    });

    // Log 2: Active log on Tata Winger (placing it In Shop)
    await MaintenanceLog.create({
      vehicleId: wingerVehicle.id,
      description: 'Engine Timing Belt replacement',
      cost: 25000.00,
      startDate: '2026-07-11',
      status: 'Active'
    });
    console.log('Inserted maintenance history.');

    // 6. Create Expenses (Tolls) for Completed Trip
    await Expense.create({
      vehicleId: volvoVehicle.id,
      tripId: tripCompleted.id,
      type: 'Toll',
      amount: 1850.00,
      date: '2026-07-10'
    });
    await Expense.create({
      vehicleId: volvoVehicle.id,
      tripId: tripCompleted.id,
      type: 'Other',
      amount: 500.00,
      date: '2026-07-10'
    });
    console.log('Inserted tolls and miscellaneous expenses.');

    console.log('\n======================================================');
    console.log('🚀 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Use the following credentials to test your platform:');
    console.log('- Fleet Manager   : manager@transitops.com / password123');
    console.log('- Driver          : driver@transitops.com / password123');
    console.log('- Safety Officer  : safety@transitops.com / password123');
    console.log('- Financial Analyst: finance@transitops.com / password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Fatal seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
