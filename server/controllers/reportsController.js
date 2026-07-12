const { Trip, Vehicle, Driver } = require('../models');
const { Parser } = require('json2csv');

exports.exportTripsCSV = async (req, res) => {
  try {
    let trips = [];

    if (global.isMockMode) {
      const mockDb = require('../config/mockDb');
      const tripsRaw = mockDb.getTrips();
      const vehicles = mockDb.getVehicles();
      const drivers = mockDb.getDrivers();

      trips = tripsRaw.map(t => {
        const data = { ...t };
        const v = vehicles.find(veh => veh.id === data.vehicleId);
        const d = drivers.find(drv => drv.id === data.driverId);
        data.vehicleRegistration = v ? v.registrationNumber : 'N/A';
        data.driverName = d ? d.name : 'N/A';
        return data;
      });
    } else {
      // Standard SQL Mode
      const tripsRaw = await Trip.findAll({
        include: [
          { model: Vehicle, as: 'vehicle', attributes: ['registrationNumber'] },
          { model: Driver, as: 'driver', attributes: ['name'] }
        ]
      });

      trips = tripsRaw.map(t => {
        const data = t.toJSON();
        data.vehicleRegistration = data.vehicle ? data.vehicle.registrationNumber : 'N/A';
        data.driverName = data.driver ? data.driver.name : 'N/A';
        return data;
      });
    }

    const fields = [
      { label: 'Trip ID', value: 'id' },
      { label: 'Source', value: 'source' },
      { label: 'Destination', value: 'destination' },
      { label: 'Vehicle Registration', value: 'vehicleRegistration' },
      { label: 'Driver Name', value: 'driverName' },
      { label: 'Cargo Weight (kg)', value: 'cargoWeight' },
      { label: 'Planned Distance (km)', value: 'plannedDistance' },
      { label: 'Start Odometer (km)', value: 'startOdometer' },
      { label: 'End Odometer (km)', value: 'endOdometer' },
      { label: 'Status', value: 'status' },
      { label: 'Fuel Consumed (L)', value: 'fuelConsumed' },
      { label: 'Fuel Cost (INR)', value: 'fuelCost' },
      { label: 'Revenue (INR)', value: 'revenue' },
      { label: 'Completion Date', value: 'completionDate' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(trips);

    res.header('Content-Type', 'text/csv');
    res.attachment('TransitOps_Trip_Report.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return res.status(500).json({ message: 'Server error generating CSV report', error: error.message });
  }
};
