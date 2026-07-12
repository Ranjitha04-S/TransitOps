import { useEffect, useState, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchVehiclesList, 
  addVehicle, 
  fetchDriversList, 
  addDriver, 
  clearRegistryStatus 
} from '../redux/registriesSlice';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { 
  Truck, 
  User, 
  Plus, 
  Search, 
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

const Registries = () => {
  const dispatch = useDispatch();
  const { 
    vehicles, 
    drivers, 
    vehiclesLoading, 
    driversLoading, 
    submitting, 
    error, 
    successMessage 
  } = useSelector((state) => state.registries);

  // Active Registry Tab: 'vehicles' | 'drivers'
  const [activeTab, setActiveTab] = useState('vehicles');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');
  const [, startTransition] = useTransition();

  // Filters State for Vehicles
  const [vehicleFilters, setVehicleFilters] = useState({
    type: 'All',
    status: 'All',
    region: 'All'
  });

  // Modal States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  // Forms State
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '',
    name: '',
    model: '',
    type: 'Truck',
    region: 'North',
    maxLoadCapacity: '',
    odometer: '0',
    acquisitionCost: ''
  });

  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    password: 'driver-default-key-123', // required by backend creation schema
    licenseNumber: '',
    licenseCategory: 'Class A',
    licenseExpiryDate: '',
    contactNumber: '',
    safetyScore: '90'
  });

  const [formErrors, setFormErrors] = useState({});

  // Sync Registry fetch based on Active Tab
  useEffect(() => {
    if (activeTab === 'vehicles') {
      dispatch(fetchVehiclesList({ ...vehicleFilters, search: searchQuery }));
    } else {
      dispatch(fetchDriversList({ search: searchQuery }));
    }
  }, [dispatch, activeTab, vehicleFilters, searchQuery]);

  // Tab switch handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setFormErrors({});
    dispatch(clearRegistryStatus());
  };

  const handleVehicleFilterChange = (e) => {
    const { name, value } = e.target;
    setVehicleFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Add Vehicle Submit
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!vehicleForm.registrationNumber.trim()) errors.registrationNumber = 'Registration plate number is required';
    if (!vehicleForm.name.trim()) errors.name = 'Asset manufacturer/name is required';
    if (!vehicleForm.model.trim()) errors.model = 'Model version is required';
    if (!vehicleForm.maxLoadCapacity || parseFloat(vehicleForm.maxLoadCapacity) < 1) {
      errors.maxLoadCapacity = 'Max payload capacity must be at least 1 kg';
    }
    if (parseFloat(vehicleForm.odometer) < 0) {
      errors.odometer = 'Odometer reading cannot be negative';
    }
    if (!vehicleForm.acquisitionCost || parseFloat(vehicleForm.acquisitionCost) <= 0) {
      errors.acquisitionCost = 'Acquisition cost is required for ROI calculations';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const payload = {
      registrationNumber: vehicleForm.registrationNumber,
      name: vehicleForm.name,
      model: vehicleForm.model,
      type: vehicleForm.type,
      region: vehicleForm.region,
      maxLoadCapacity: parseFloat(vehicleForm.maxLoadCapacity),
      odometer: parseFloat(vehicleForm.odometer),
      acquisitionCost: parseFloat(vehicleForm.acquisitionCost)
    };

    const result = await dispatch(addVehicle(payload));
    if (addVehicle.fulfilled.match(result)) {
      setIsVehicleModalOpen(false);
      setVehicleForm({
        registrationNumber: '',
        name: '',
        model: '',
        type: 'Truck',
        region: 'North',
        maxLoadCapacity: '',
        odometer: '0',
        acquisitionCost: ''
      });
      dispatch(fetchVehiclesList(vehicleFilters));
      setTimeout(() => dispatch(clearRegistryStatus()), 3000);
    }
  };

  // Add Driver Submit
  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!driverForm.name.trim()) errors.name = 'Driver full name is required';
    if (!driverForm.email.trim()) {
      errors.email = 'Workstation email is required';
    } else if (!/\S+@\S+\.\S+/.test(driverForm.email)) {
      errors.email = 'Invalid email address format';
    }
    if (!driverForm.licenseNumber.trim()) errors.licenseNumber = 'License number is required';
    if (!driverForm.licenseExpiryDate) errors.licenseExpiryDate = 'License expiration date is required';
    if (!driverForm.contactNumber.trim()) errors.contactNumber = 'Contact number is required';
    
    const safety = parseInt(driverForm.safetyScore);
    if (isNaN(safety) || safety < 0 || safety > 100) {
      errors.safetyScore = 'Safety score must be between 0 and 100';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const payload = {
      name: driverForm.name,
      email: driverForm.email,
      password: driverForm.password,
      licenseNumber: driverForm.licenseNumber,
      licenseCategory: driverForm.licenseCategory,
      licenseExpiryDate: driverForm.licenseExpiryDate,
      contactNumber: driverForm.contactNumber,
      safetyScore: parseInt(driverForm.safetyScore)
    };

    const result = await dispatch(addDriver(payload));
    if (addDriver.fulfilled.match(result)) {
      setIsDriverModalOpen(false);
      setDriverForm({
        name: '',
        email: '',
        password: 'driver-default-key-123',
        licenseNumber: '',
        licenseCategory: 'Class A',
        licenseExpiryDate: '',
        contactNumber: '',
        safetyScore: '90'
      });
      dispatch(fetchDriversList());
      setTimeout(() => dispatch(clearRegistryStatus()), 3000);
    }
  };

  // Define Columns structures
  const vehicleColumns = [
    {
      key: 'registrationNumber',
      label: 'Registration Number',
      sortable: true,
      render: (row) => <span className="font-bold text-text-primary">{row.registrationNumber}</span>
    },
    {
      key: 'name',
      label: 'Name / Model',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{row.name}</span>
          <span className="text-[10px] text-text-secondary">{row.model}</span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => <Badge variant="neutral">{row.type}</Badge>
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true,
    },
    {
      key: 'maxLoadCapacity',
      label: 'Max Capacity (kg)',
      sortable: true,
      render: (row) => <span>{parseFloat(row.maxLoadCapacity).toLocaleString()} kg</span>
    },
    {
      key: 'odometer',
      label: 'Odometer (km)',
      sortable: true,
      render: (row) => <span>{parseFloat(row.odometer).toLocaleString()} km</span>
    },
    {
      key: 'acquisitionCost',
      label: 'Acquisition Cost',
      sortable: true,
      render: (row) => <span>₹{parseFloat(row.acquisitionCost).toLocaleString()}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const variants = {
          Available: 'success',
          'On Trip': 'info',
          'In Shop': 'warning',
          Retired: 'danger'
        };
        return <Badge variant={variants[row.status] || 'neutral'}>{row.status}</Badge>;
      }
    }
  ];

  const driverColumns = [
    {
      key: 'name',
      label: 'Driver Name',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary">{row.name ?? row.user?.name}</span>
          <span className="text-[10px] text-text-secondary">{row.email ?? row.user?.email}</span>
        </div>
      )
    },
    {
      key: 'licenseNumber',
      label: 'License Number',
      sortable: true,
    },
    {
      key: 'licenseCategory',
      label: 'Category',
      sortable: true,
      render: (row) => <Badge variant="neutral">{row.licenseCategory ?? 'Class A'}</Badge>
    },
    {
      key: 'licenseExpiryDate',
      label: 'Expiry Date',
      sortable: true,
      render: (row) => {
        const isExpired = row.isLicenseExpired;
        return (
          <div className="flex items-center gap-1.5 font-semibold">
            <span className={isExpired ? 'text-danger' : 'text-text-secondary'}>
              {row.licenseExpiryDate}
            </span>
            {isExpired && (
              <Badge variant="danger" className="animate-pulse">
                <ShieldAlert size={10} className="mr-0.5" /> Expired
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      sortable: false,
    },
    {
      key: 'safetyScore',
      label: 'Safety Score',
      sortable: true,
      render: (row) => {
        const score = row.safetyScore ?? 90;
        let variant = 'success';
        if (score < 70) variant = 'danger';
        else if (score <= 85) variant = 'warning';

        return <Badge variant={variant}>{score} / 100</Badge>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const variants = {
          Available: 'success',
          'On Trip': 'info',
          'Suspended': 'danger'
        };
        return <Badge variant={variants[row.status] || 'neutral'}>{row.status}</Badge>;
      }
    }
  ];

  // Helper values for offline display simulation
  const defaultVehicles = [
    { id: 1, registrationNumber: 'TX-892-PL', name: 'Freightliner Cascadia', model: '2024', type: 'Truck', region: 'North', maxLoadCapacity: 15000, odometer: 12450, acquisitionCost: 135000, status: 'Available' },
    { id: 2, registrationNumber: 'CA-481-QA', name: 'Volvo VNL 860', model: '2023', type: 'Truck', region: 'West', maxLoadCapacity: 16000, odometer: 8320, acquisitionCost: 142000, status: 'On Trip' },
    { id: 3, registrationNumber: 'NY-992-XD', name: 'Peterbilt 579', model: '2022', type: 'Truck', region: 'East', maxLoadCapacity: 15500, odometer: 14020, acquisitionCost: 138000, status: 'In Shop' },
    { id: 4, registrationNumber: 'FL-234-ZZ', name: 'Ford Transit 350', model: '2021', type: 'Van', region: 'South', maxLoadCapacity: 3500, odometer: 5120, acquisitionCost: 48000, status: 'Available' }
  ];

  const defaultDrivers = [
    { id: 1, name: 'Marcus Webb', email: 'mwebb@trnspot.com', licenseNumber: 'DL-9082341', licenseCategory: 'Class A', licenseExpiryDate: '2028-11-12', contactNumber: '555-0192', safetyScore: 92, status: 'On Trip', isLicenseExpired: false },
    { id: 2, name: 'Sarah Lin', email: 'slin@trnspot.com', licenseNumber: 'DL-3891022', licenseCategory: 'Class B', licenseExpiryDate: '2027-04-18', contactNumber: '555-0143', safetyScore: 78, status: 'Available', isLicenseExpired: false },
    { id: 3, name: 'David Ross', email: 'dross@trnspot.com', licenseNumber: 'DL-1289012', licenseCategory: 'Class A', licenseExpiryDate: '2026-06-01', contactNumber: '555-0177', safetyScore: 88, status: 'Available', isLicenseExpired: true },
    { id: 4, name: 'Alex Mercer', email: 'amercer@trnspot.com', licenseNumber: 'DL-5678234', licenseCategory: 'Class C', licenseExpiryDate: '2029-01-20', contactNumber: '555-0111', safetyScore: 64, status: 'Available', isLicenseExpired: false }
  ];

  const displayVehicles = vehicles.length > 0 ? vehicles : defaultVehicles;
  const displayDrivers = drivers.length > 0 ? drivers : defaultDrivers;

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 max-w-full">
        {/* Toggle navigation bar header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => handleTabChange('vehicles')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer
                ${activeTab === 'vehicles' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              <Truck size={16} />
              <span>Vehicles Registry</span>
            </button>
            
            <button
              onClick={() => handleTabChange('drivers')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer
                ${activeTab === 'drivers' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              <User size={16} />
              <span>Drivers Registry</span>
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => activeTab === 'vehicles' ? setIsVehicleModalOpen(true) : setIsDriverModalOpen(true)}
            className="flex items-center gap-2 py-2.5"
          >
            <Plus size={15} />
            <span>Add {activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}</span>
          </Button>
        </div>

        {/* Global Notices */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-success/15 border border-success/35 text-xs text-success font-semibold flex items-center gap-2.5 animate-fadeIn">
            <Badge variant="success">Notice</Badge>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-danger/15 border border-danger/35 text-xs text-danger font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Active Tab View */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
          {/* Header controls for Table */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                {activeTab === 'vehicles' ? 'Fleet Inventory assets' : 'Safety Profiles & Cleared Drivers'}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                {activeTab === 'vehicles' 
                  ? 'Overview of all truck, van, and car carrier registries.' 
                  : 'Workstation licenses and compliance ratings.'}
              </p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              {activeTab === 'vehicles' && (
                <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
                  <Select
                    options={[
                      { value: 'All', label: 'All Types' },
                      { value: 'Truck', label: 'Trucks' },
                      { value: 'Van', label: 'Vans' },
                      { value: 'Car', label: 'Cars' }
                    ]}
                    name="type"
                    value={vehicleFilters.type}
                    onChange={handleVehicleFilterChange}
                    className="sm:w-32 py-1 select-sm"
                  />

                  <Select
                    options={[
                      { value: 'All', label: 'All Statuses' },
                      { value: 'Available', label: 'Available' },
                      { value: 'On Trip', label: 'On Trip' },
                      { value: 'In Shop', label: 'In Shop' },
                      { value: 'Retired', label: 'Retired' }
                    ]}
                    name="status"
                    value={vehicleFilters.status}
                    onChange={handleVehicleFilterChange}
                    className="sm:w-32 py-1 select-sm"
                  />

                  <Select
                    options={[
                      { value: 'All', label: 'All Regions' },
                      { value: 'North', label: 'North' },
                      { value: 'South', label: 'South' },
                      { value: 'East', label: 'East' },
                      { value: 'West', label: 'West' }
                    ]}
                    name="region"
                    value={vehicleFilters.region}
                    onChange={handleVehicleFilterChange}
                    className="sm:w-32 py-1 select-sm"
                  />
                </div>
              )}

              {/* General Search */}
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
                  className="w-full bg-surface-alt border border-border text-text-primary text-xs rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-150 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          {activeTab === 'vehicles' ? (
            <DataTable
              columns={vehicleColumns}
              data={displayVehicles}
              loading={vehiclesLoading}
              searchQuery={searchQuery}
              searchKeys={['registrationNumber', 'name', 'model']}
              pageSize={5}
              emptyTitle="No Vehicles Registered"
              emptyDescription="No asset entries matching filter configuration were found."
            />
          ) : (
            <DataTable
              columns={driverColumns}
              data={displayDrivers}
              loading={driversLoading}
              searchQuery={searchQuery}
              searchKeys={['name', 'licenseNumber', 'contactNumber']}
              pageSize={5}
              emptyTitle="No Drivers Registered"
              emptyDescription="No driver registry entries matching search terms were found."
            />
          )}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        title="Register Vehicle Asset"
      >
        <form onSubmit={handleVehicleSubmit} className="flex flex-col gap-4">
          <Input
            label="Registration Number (Plate)"
            placeholder="e.g. TX-892-PL"
            value={vehicleForm.registrationNumber}
            onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
            error={formErrors.registrationNumber}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Manufacturer / Name"
              placeholder="e.g. Freightliner"
              value={vehicleForm.name}
              onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
              error={formErrors.name}
              required
            />
            
            <Input
              label="Model Version"
              placeholder="e.g. Cascadia"
              value={vehicleForm.model}
              onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
              error={formErrors.model}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Vehicle Type"
              options={[
                { value: 'Truck', label: 'Truck / Carrier' },
                { value: 'Van', label: 'Cargo Van' },
                { value: 'Car', label: 'Passenger Car' }
              ]}
              value={vehicleForm.type}
              onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
              required
            />
            
            <Select
              label="Assigned Region"
              options={[
                { value: 'North', label: 'North' },
                { value: 'South', label: 'South' },
                { value: 'East', label: 'East' },
                { value: 'West', label: 'West' }
              ]}
              value={vehicleForm.region}
              onChange={(e) => setVehicleForm({ ...vehicleForm, region: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Capacity (kg)"
              type="number"
              placeholder="e.g. 15000"
              value={vehicleForm.maxLoadCapacity}
              onChange={(e) => setVehicleForm({ ...vehicleForm, maxLoadCapacity: e.target.value })}
              error={formErrors.maxLoadCapacity}
              required
            />
            
            <Input
              label="Odometer (km)"
              type="number"
              placeholder="e.g. 0"
              value={vehicleForm.odometer}
              onChange={(e) => setVehicleForm({ ...vehicleForm, odometer: e.target.value })}
              error={formErrors.odometer}
              required
            />
          </div>

          <Input
            label="Acquisition Cost (INR)"
            type="number"
            placeholder="e.g. 1350000"
            value={vehicleForm.acquisitionCost}
            onChange={(e) => setVehicleForm({ ...vehicleForm, acquisitionCost: e.target.value })}
            error={formErrors.acquisitionCost}
            required
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsVehicleModalOpen(false)} className="py-2.5">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="py-2.5">
              Add Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Driver Modal */}
      <Modal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        title="Register Driver Profile"
      >
        <form onSubmit={handleDriverSubmit} className="flex flex-col gap-4">
          <Input
            label="Driver Full Name"
            placeholder="e.g. Ranjitha S"
            value={driverForm.name}
            onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="Workstation Email"
            type="email"
            placeholder="e.g. name@trnspot.com"
            value={driverForm.email}
            onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
            error={formErrors.email}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Number"
              placeholder="e.g. DL-9082341"
              value={driverForm.licenseNumber}
              onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
              error={formErrors.licenseNumber}
              required
            />
            
            <Select
              label="License Category"
              options={[
                { value: 'Class A', label: 'Class A (CDL)' },
                { value: 'Class B', label: 'Class B' },
                { value: 'Class C', label: 'Class C' },
                { value: 'Heavy Vehicle', label: 'Heavy Goods' },
                { value: 'Light Vehicle', label: 'Light Passenger' }
              ]}
              value={driverForm.licenseCategory}
              onChange={(e) => setDriverForm({ ...driverForm, licenseCategory: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiration Date"
              type="date"
              value={driverForm.licenseExpiryDate}
              onChange={(e) => setDriverForm({ ...driverForm, licenseExpiryDate: e.target.value })}
              error={formErrors.licenseExpiryDate}
              required
            />

            <Input
              label="Contact Number"
              placeholder="e.g. 555-0192"
              value={driverForm.contactNumber}
              onChange={(e) => setDriverForm({ ...driverForm, contactNumber: e.target.value })}
              error={formErrors.contactNumber}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase text-text-secondary flex justify-between">
              <span>Safety Performance Score</span>
              <span className="text-primary font-bold">{driverForm.safetyScore} / 100</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={driverForm.safetyScore}
              onChange={(e) => setDriverForm({ ...driverForm, safetyScore: e.target.value })}
              className="w-full accent-primary h-1.5 bg-surface-alt rounded-lg cursor-pointer"
            />
            {formErrors.safetyScore && (
              <span className="text-[11px] text-danger font-medium mt-0.5 animate-pulse">
                {formErrors.safetyScore}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDriverModalOpen(false)} className="py-2.5">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="py-2.5">
              Add Driver
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default Registries;
