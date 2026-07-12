const bcrypt = require('bcryptjs');

// Global mock memory storage
let users = [];
let vehicles = [];
let drivers = [];
let trips = [];
let maintenanceLogs = [];
let expenses = [];

// Initialize mock data (same as seed.js)
const initializeMockData = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 1. Users
  users = [
    { id: 1, email: 'manager@transitops.com', password: hashedPassword, role: 'Fleet Manager' },
    { id: 2, email: 'driver@transitops.com', password: hashedPassword, role: 'Driver' },
    { id: 3, email: 'safety@transitops.com', password: hashedPassword, role: 'Safety Officer' },
    { id: 4, email: 'finance@transitops.com', password: hashedPassword, role: 'Financial Analyst' }
  ];

  // 2. Drivers
  drivers = [
    {
      id: 1,
      userId: 2,
      name: 'John Doe',
      licenseNumber: 'DL-552912400',
      licenseCategory: 'Commercial Heavy',
      licenseExpiryDate: '2028-12-31',
      contactNumber: '+919999988888',
      safetyScore: 95,
      status: 'Available'
    },
    {
      id: 2,
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
      id: 3,
      userId: null,
      name: 'Bob Jenkins (Expired)',
      licenseNumber: 'DL-EXPIRED-99',
      licenseCategory: 'Commercial Light',
      licenseExpiryDate: '2025-01-01',
      contactNumber: '+917777766666',
      safetyScore: 78,
      status: 'Available'
    }
  ];

  // 3. Vehicles
  vehicles = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
      id: 4,
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
  ];

  // 4. Trips
  trips = [
    {
      id: 1,
      source: 'Chennai Port',
      destination: 'Bangalore Depot',
      vehicleId: 1,
      driverId: 1,
      cargoWeight: 12000.00,
      plannedDistance: 350.00,
      startOdometer: 44850.00,
      endOdometer: 45200.50,
      status: 'Completed',
      fuelConsumed: 110.00,
      fuelCost: 9900.00,
      revenue: 85000.00,
      completionDate: '2026-07-10',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      source: 'Mumbai Hub',
      destination: 'Pune Warehouse',
      vehicleId: 2,
      driverId: 2,
      cargoWeight: 8500.00,
      plannedDistance: 150.00,
      startOdometer: 18250.00,
      status: 'Dispatched',
      revenue: 35000.00,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      source: 'Delhi Depot',
      destination: 'Noida Store',
      vehicleId: 4,
      driverId: 1,
      cargoWeight: 400.00,
      plannedDistance: 45.00,
      status: 'Draft',
      revenue: 5000.00,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // 5. Maintenance
  maintenanceLogs = [
    {
      id: 1,
      vehicleId: 1,
      description: 'Wheel Alignment & Tire Rotation',
      cost: 15000.00,
      startDate: '2026-07-01',
      endDate: '2026-07-02',
      status: 'Closed',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      vehicleId: 3,
      description: 'Engine Timing Belt replacement',
      cost: 25000.00,
      startDate: '2026-07-11',
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // 6. Expenses
  expenses = [
    {
      id: 1,
      vehicleId: 1,
      tripId: 1,
      type: 'Toll',
      amount: 1850.00,
      date: '2026-07-10',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      vehicleId: 1,
      tripId: 1,
      type: 'Other',
      amount: 500.00,
      date: '2026-07-10',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};

module.exports = {
  getUsers: () => users,
  getVehicles: () => vehicles,
  getDrivers: () => drivers,
  getTrips: () => trips,
  getMaintenanceLogs: () => maintenanceLogs,
  getExpenses: () => expenses,
  initializeMockData
};
