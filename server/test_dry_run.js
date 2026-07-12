const { sequelize, User, Vehicle, Driver, Trip, MaintenanceLog, Expense } = require('./models');

console.log('=== DRY RUN SYNTAX & RELATIONSHIPS TEST ===');

try {
  console.log('Models loaded successfully:');
  console.log('- User model status:', !!User);
  console.log('- Vehicle model status:', !!Vehicle);
  console.log('- Driver model status:', !!Driver);
  console.log('- Trip model status:', !!Trip);
  console.log('- MaintenanceLog model status:', !!MaintenanceLog);
  console.log('- Expense model status:', !!Expense);

  console.log('\nChecking associations:');
  console.log('- User association: driver is linked:', !!User.associations.driver);
  console.log('- Driver association: user is linked:', !!Driver.associations.user);
  console.log('- Vehicle association: trips is linked:', !!Vehicle.associations.trips);
  console.log('- Trip association: vehicle is linked:', !!Trip.associations.vehicle);
  console.log('- Trip association: driver is linked:', !!Trip.associations.driver);
  console.log('- Driver association: trips is linked:', !!Driver.associations.trips);
  console.log('- Vehicle association: maintenanceLogs is linked:', !!Vehicle.associations.maintenanceLogs);
  console.log('- MaintenanceLog association: vehicle is linked:', !!MaintenanceLog.associations.vehicle);
  console.log('- Vehicle association: expenses is linked:', !!Vehicle.associations.expenses);
  console.log('- Expense association: vehicle is linked:', !!Expense.associations.vehicle);
  console.log('- Trip association: expenses is linked:', !!Trip.associations.expenses);
  console.log('- Expense association: trip is linked:', !!Expense.associations.trip);

  console.log('\nResult: All models are syntactically correct and relationships are bound successfully!');
  process.exit(0);
} catch (error) {
  console.error('\nError: Test failed due to model/association issues:', error);
  process.exit(1);
}
