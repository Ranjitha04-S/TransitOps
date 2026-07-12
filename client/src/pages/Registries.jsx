import { useEffect, useState, useTransition, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchVehiclesList, 
  addVehicle,
  updateVehicle,
  deleteVehicle,
  fetchDriversList, 
  addDriver,
  updateDriver,
  deleteDriver,
  clearRegistryStatus 
} from '../redux/registriesSlice';
import AuthContext from '../context/AuthContext';
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
  AlertCircle,
  Pencil,
  Trash2
} from 'lucide-react';

const Registries = () => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const userRole = user?.role;

  const { 
    vehicles, 
    drivers, 
    vehiclesLoading, 
    driversLoading, 
    submitting, 
    error, 
    successMessage 
  } = useSelector((state) => state.registries);

  const [activeTab, setActiveTab] = useState('vehicles');
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
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);

  // Forms State
  const defaultVehicleForm = {
    registrationNumber: '',
    name: '',
    model: '',
    type: 'Truck',
    region: 'North',
    maxLoadCapacity: '',
    odometer: '0',
    acquisitionCost: ''
  };

  const defaultDriverForm = {
    name: '',
    email: '',
    password: 'driver-default-key-123',
    licenseNumber: '',
    licenseCategory: 'Class A',
    licenseExpiryDate: '',
    contactNumber: '',
    safetyScore: '90'
  };

  const [vehicleForm, setVehicleForm] = useState(defaultVehicleForm);
  const [driverForm, setDriverForm] = useState(defaultDriverForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'vehicles') {
      dispatch(fetchVehiclesList({ ...vehicleFilters, search: searchQuery }));
    } else {
      dispatch(fetchDriversList({ search: searchQuery }));
    }
  }, [dispatch, activeTab, vehicleFilters, searchQuery]);

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

  // Open ADD vehicle modal
  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm(defaultVehicleForm);
    setFormErrors({});
    setIsVehicleModalOpen(true);
  };

  // Open EDIT vehicle modal with pre-filled data
  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      registrationNumber: vehicle.registrationNumber || '',
      name: vehicle.name || '',
      model: vehicle.model || '',
      type: vehicle.type || 'Truck',
      region: vehicle.region || 'North',
      maxLoadCapacity: String(vehicle.maxLoadCapacity || ''),
      odometer: String(vehicle.odometer || '0'),
      acquisitionCost: String(vehicle.acquisitionCost || '')
    });
    setFormErrors({});
    setIsVehicleModalOpen(true);
  };

  // Handle vehicle delete
  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) return;
    const result = await dispatch(deleteVehicle(id));
    if (deleteVehicle.fulfilled.match(result)) {
      setTimeout(() => dispatch(clearRegistryStatus()), 3000);
    }
  };

  // Open ADD driver modal
  const handleAddDriver = () => {
    setEditingDriver(null);
    setDriverForm(defaultDriverForm);
    setFormErrors({});
    setIsDriverModalOpen(true);
  };

  // Open EDIT driver modal with pre-filled data
  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setDriverForm({
      name: driver.name || '',
      email: driver.email || '',
      password: 'driver-default-key-123',
      licenseNumber: driver.licenseNumber || '',
      licenseCategory: driver.licenseCategory || 'Class A',
      licenseExpiryDate: driver.licenseExpiryDate || '',
      contactNumber: driver.contactNumber || '',
      safetyScore: String(driver.safetyScore ?? '90')
    });
    setFormErrors({});
    setIsDriverModalOpen(true);
  };

  // Handle driver delete
  const handleDeleteDriver = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver profile?')) return;
    const result = await dispatch(deleteDriver(id));
    if (deleteDriver.fulfilled.match(result)) {
      setTimeout(() => dispatch(clearRegistryStatus()), 3000);
    }
  };

  // Add / Update Vehicle Submit
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

    let result;
    if (editingVehicle) {
      result = await dispatch(updateVehicle({ id: editingVehicle.id, vehicleData: payload }));
    } else {
      result = await dispatch(addVehicle(payload));
    }

    const actionCreator = editingVehicle ? updateVehicle : addVehicle;
    if (actionCreator.fulfilled.match(result)) {
      setIsVehicleModalOpen(false);
      setVehicleForm(defaultVehicleForm);
      setEditingVehicle(null);
      dispatch(fetchVehiclesList(vehicleFilters));
      setTimeout(() => dispatch(clearRegistryStatus()), 3000);
    }
  };

  // Add / Update Driver Submit
  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!driverForm.name.trim()) errors.name = 'Driver full name is required';
    if (!editingDriver) {
      if (!driverForm.email.trim()) {
        errors.email = 'Workstation email is required';
      } else if (!/\S+@\S+\.\S+/.test(driverForm.email)) {
        errors.email = 'Invalid email address format';
      }
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

    let result;
    if (editingDriver) {
      const payload = {
        name: driverForm.name,
        licenseNumber: driverForm.licenseNumber,
        licenseCategory: driverForm.licenseCategory,
        licenseExpiryDate: driverForm.licenseExpiryDate,
        contactNumber: driverForm.contactNumber,
        safetyScore: parseInt(driverForm.safetyScore)
      };
      result = await dispatch(updateDriver({ id: editingDriver.id, driverData: payload }));
      if (updateDriver.fulfilled.match(result)) {
        setIsDriverModalOpen(false);
        setEditingDriver(null);
        dispatch(fetchDriversList());
        setTimeout(() => dispatch(clearRegistryStatus()), 3000);
      }
    } else {
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
      result = await dispatch(addDriver(payload));
      if (addDriver.fulfilled.match(result)) {
        setIsDriverModalOpen(false);
        setDriverForm(defaultDriverForm);
        dispatch(fetchDriversList());
        setTimeout(() => dispatch(clearRegistryStatus()), 3000);
      }
    }
  };

  const isFleetManager = userRole === 'Fleet Manager';
  const isSafetyOfficer = userRole === 'Safety Officer';
  const canEditDriver = isFleetManager || isSafetyOfficer;

  // Vehicle columns — action column only for Fleet Managers
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
    },
    ...(isFleetManager ? [{
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEditVehicle(row)}
            className="flex items-center gap-1 text-primary text-xs font-semibold cursor-pointer hover:opacity-70 transition-opacity"
            title="Edit Vehicle"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleDeleteVehicle(row.id)}
            className="flex items-center gap-1 text-danger text-xs font-semibold cursor-pointer hover:opacity-70 transition-opacity"
            title="Delete Vehicle"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      )
    }] : [])
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
          Suspended: 'danger'
        };
        return <Badge variant={variants[row.status] || 'neutral'}>{row.status}</Badge>;
      }
    },
    ...(canEditDriver ? [{
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEditDriver(row)}
            className="flex items-center gap-1 text-primary text-xs font-semibold cursor-pointer hover:opacity-70 transition-opacity"
            title="Edit Driver"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
          {isFleetManager && (
            <button
              onClick={() => handleDeleteDriver(row.id)}
              className="flex items-center gap-1 text-danger text-xs font-semibold cursor-pointer hover:opacity-70 transition-opacity"
              title="Delete Driver"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )
    }] : [])
  ];

  const displayVehicles = vehicles.length > 0 ? vehicles : [];
  const displayDrivers = drivers.length > 0 ? drivers : [];

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

          {/* Add button: only Fleet Manager can add vehicles; Fleet Manager + Safety Officer can add drivers */}
          {activeTab === 'vehicles' && isFleetManager && (
            <Button
              variant="primary"
              onClick={handleAddVehicle}
              className="flex items-center gap-2 py-2.5"
            >
              <Plus size={15} />
              <span>Add Vehicle</span>
            </Button>
          )}
          {activeTab === 'drivers' && isFleetManager && (
            <Button
              variant="primary"
              onClick={handleAddDriver}
              className="flex items-center gap-2 py-2.5"
            >
              <Plus size={15} />
              <span>Add Driver</span>
            </Button>
          )}
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
                {activeTab === 'vehicles' ? 'Fleet Inventory Assets' : 'Safety Profiles & Cleared Drivers'}
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

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => { setIsVehicleModalOpen(false); setEditingVehicle(null); }}
        title={editingVehicle ? `Edit Vehicle — ${editingVehicle.registrationNumber}` : 'Register Vehicle Asset'}
      >
        <form onSubmit={handleVehicleSubmit} className="flex flex-col gap-4">
          <Input
            label="Registration Number (Plate)"
            placeholder="e.g. MH-12-TR-9981"
            value={vehicleForm.registrationNumber}
            onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
            error={formErrors.registrationNumber}
            required
            disabled={!!editingVehicle}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Manufacturer / Name"
              placeholder="e.g. Volvo"
              value={vehicleForm.name}
              onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
              error={formErrors.name}
              required
            />
            
            <Input
              label="Model Version"
              placeholder="e.g. FMX"
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
            label="Acquisition Cost (₹)"
            type="number"
            placeholder="e.g. 4500000"
            value={vehicleForm.acquisitionCost}
            onChange={(e) => setVehicleForm({ ...vehicleForm, acquisitionCost: e.target.value })}
            error={formErrors.acquisitionCost}
            required
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => { setIsVehicleModalOpen(false); setEditingVehicle(null); }} className="py-2.5">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="py-2.5">
              {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Driver Modal */}
      <Modal
        isOpen={isDriverModalOpen}
        onClose={() => { setIsDriverModalOpen(false); setEditingDriver(null); }}
        title={editingDriver ? `Edit Driver — ${editingDriver.name}` : 'Register Driver Profile'}
      >
        <form onSubmit={handleDriverSubmit} className="flex flex-col gap-4">
          <Input
            label="Driver Full Name"
            placeholder="e.g. John Doe"
            value={driverForm.name}
            onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
            error={formErrors.name}
            required
          />

          {!editingDriver && (
            <Input
              label="Workstation Email"
              type="email"
              placeholder="e.g. name@transitops.com"
              value={driverForm.email}
              onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
              error={formErrors.email}
              required
            />
          )}

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
                { value: 'Light Vehicle', label: 'Light Passenger' },
                { value: 'Commercial Heavy', label: 'Commercial Heavy' },
                { value: 'Commercial Light', label: 'Commercial Light' }
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
              placeholder="e.g. +919999988888"
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
            <Button variant="outline" onClick={() => { setIsDriverModalOpen(false); setEditingDriver(null); }} className="py-2.5">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="py-2.5">
              {editingDriver ? 'Save Changes' : 'Add Driver'}
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default Registries;
