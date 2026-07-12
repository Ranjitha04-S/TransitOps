import { useEffect, useState, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTripsList, 
  fetchAvailableVehicles, 
  fetchAvailableDrivers, 
  createTripDraft, 
  dispatchTrip, 
  cancelTrip, 
  completeTrip,
  clearTripStatus 
} from '../redux/tripsSlice';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { 
  Plus, 
  Search, 
  CheckSquare, 
  AlertTriangle, 
  AlertCircle,
  MapPin,
  Play,
  XSquare,
  Compass
} from 'lucide-react';

const Trips = () => {
  const dispatch = useDispatch();
  const { 
    trips, 
    availableVehicles, 
    availableDrivers, 
    tripsLoading, 
    submitting, 
    error, 
    successMessage 
  } = useSelector((state) => state.trips);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const [, startTransition] = useTransition();

  // Status Filter: 'All' | 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled'
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal control states
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Create Trip form state
  const [tripForm, setTripForm] = useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    plannedDistance: '',
    revenue: ''
  });

  // Completion Form state
  const [completionForm, setCompletionForm] = useState({
    tripId: null,
    vehicleReg: '',
    startOdometer: 0,
    endOdometer: '',
    fuelConsumed: '',
    fuelCost: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchTripsList({ status: statusFilter }));
    if (isDraftModalOpen) {
      dispatch(fetchAvailableVehicles());
      dispatch(fetchAvailableDrivers());
    }
  }, [dispatch, statusFilter, isDraftModalOpen]);

  // Form Warnings triggers
  const selectedVehicle = availableVehicles.find(v => String(v.id) === String(tripForm.vehicleId));
  const selectedDriver = availableDrivers.find(d => String(d.id) === String(tripForm.driverId));

  const isWeightWarning = selectedVehicle && tripForm.cargoWeight && parseFloat(tripForm.cargoWeight) > parseFloat(selectedVehicle.maxLoadCapacity);
  const isDriverExpiredWarning = selectedDriver && selectedDriver.isLicenseExpired;

  // Handle Form Input change
  const handleTripFormChange = (e) => {
    const { name, value } = e.target;
    setTripForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Trip Draft
  const handleCreateDraftSubmit = async (e) => {
    e.preventDefault();
    if (isWeightWarning || isDriverExpiredWarning) return;

    const errors = {};
    if (!tripForm.source.trim()) errors.source = 'Source location is required';
    if (!tripForm.destination.trim()) errors.destination = 'Destination location is required';
    if (!tripForm.vehicleId) errors.vehicleId = 'Vehicle assignment is required';
    if (!tripForm.driverId) errors.driverId = 'Driver assignment is required';
    
    if (!tripForm.cargoWeight || parseFloat(tripForm.cargoWeight) <= 0) {
      errors.cargoWeight = 'Cargo weight must be greater than 0';
    }
    if (!tripForm.plannedDistance || parseFloat(tripForm.plannedDistance) <= 0) {
      errors.plannedDistance = 'Planned distance must be greater than 0';
    }
    if (!tripForm.revenue || parseFloat(tripForm.revenue) < 0) {
      errors.revenue = 'Revenue must be a valid currency number';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const payload = {
      source: tripForm.source,
      destination: tripForm.destination,
      vehicleId: parseInt(tripForm.vehicleId),
      driverId: parseInt(tripForm.driverId),
      cargoWeight: parseFloat(tripForm.cargoWeight),
      plannedDistance: parseFloat(tripForm.plannedDistance),
      revenue: parseFloat(tripForm.revenue)
    };

    const result = await dispatch(createTripDraft(payload));
    if (createTripDraft.fulfilled.match(result)) {
      setIsDraftModalOpen(false);
      setTripForm({
        source: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        plannedDistance: '',
        revenue: ''
      });
      dispatch(fetchTripsList({ status: statusFilter }));
      setTimeout(() => dispatch(clearTripStatus()), 3000);
    }
  };

  // Trigger dispatch thunk
  const handleDispatch = async (tripId) => {
    const result = await dispatch(dispatchTrip(tripId));
    if (dispatchTrip.fulfilled.match(result)) {
      dispatch(fetchTripsList({ status: statusFilter }));
      setTimeout(() => dispatch(clearTripStatus()), 3000);
    }
  };

  // Trigger cancel thunk
  const handleCancel = async (tripId) => {
    const result = await dispatch(cancelTrip(tripId));
    if (cancelTrip.fulfilled.match(result)) {
      dispatch(fetchTripsList({ status: statusFilter }));
      setTimeout(() => dispatch(clearTripStatus()), 3000);
    }
  };

  // Launch Completion dialog
  const handleOpenCompleteModal = (row) => {
    setCompletionForm({
      tripId: row.id,
      vehicleReg: row.vehicle?.registrationNumber ?? 'Unknown',
      startOdometer: row.startOdometer ?? 0,
      endOdometer: '',
      fuelConsumed: '',
      fuelCost: ''
    });
    setIsCompleteModalOpen(true);
    setFormErrors({});
  };

  // Submit Completion Form
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!completionForm.endOdometer || parseFloat(completionForm.endOdometer) < parseFloat(completionForm.startOdometer)) {
      errors.endOdometer = `End odometer cannot be less than start odometer (${completionForm.startOdometer} km)`;
    }
    if (!completionForm.fuelConsumed || parseFloat(completionForm.fuelConsumed) < 0) {
      errors.fuelConsumed = 'Fuel consumption (liters) is required';
    }
    if (!completionForm.fuelCost || parseFloat(completionForm.fuelCost) < 0) {
      errors.fuelCost = 'Fuel cost is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const payload = {
      endOdometer: parseFloat(completionForm.endOdometer),
      fuelConsumed: parseFloat(completionForm.fuelConsumed),
      fuelCost: parseFloat(completionForm.fuelCost)
    };

    const result = await dispatch(completeTrip({
      tripId: completionForm.tripId,
      completionData: payload
    }));

    if (completeTrip.fulfilled.match(result)) {
      setIsCompleteModalOpen(false);
      dispatch(fetchTripsList({ status: statusFilter }));
      setTimeout(() => dispatch(clearTripStatus()), 3000);
    }
  };

  // Map Data Columns
  const tripColumns = [
    {
      key: 'id',
      label: 'Trip ID',
      sortable: true,
      render: (row) => <span className="font-bold text-text-primary">#TR-{row.id}</span>
    },
    {
      key: 'route',
      label: 'Route Destination',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{row.source} → {row.destination}</span>
          <span className="text-[10px] text-text-secondary">{parseFloat(row.plannedDistance).toLocaleString()} km planned</span>
        </div>
      )
    },
    {
      key: 'vehicle',
      label: 'Vehicle (Reg Number)',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{row.vehicle?.registrationNumber ?? 'Unassigned'}</span>
          <span className="text-[10px] text-text-secondary">{row.vehicle?.name ?? 'Volvo FH16'}</span>
        </div>
      )
    },
    {
      key: 'driver',
      label: 'Driver Name',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{row.driver?.name ?? 'Unassigned'}</span>
          <span className="text-[10px] text-text-secondary">License: {row.driver?.licenseNumber ?? 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'cargoWeight',
      label: 'Cargo Weight',
      sortable: true,
      render: (row) => <span>{parseFloat(row.cargoWeight).toLocaleString()} kg</span>
    },
    {
      key: 'revenue',
      label: 'Revenue',
      sortable: true,
      render: (row) => <span className="text-success font-semibold">₹{parseFloat(row.revenue).toLocaleString()}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const variants = {
          Draft: 'neutral',
          Dispatched: 'info',
          Completed: 'success',
          Cancelled: 'danger'
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => {
        if (row.status === 'Draft') {
          return (
            <Button
              variant="outline"
              onClick={() => handleDispatch(row.id)}
              className="flex items-center gap-1.5 text-info border-info/35 hover:bg-info/5 py-1 px-3 text-[10px] rounded-lg"
            >
              <Play size={11} />
              <span>Dispatch Trip</span>
            </Button>
          );
        }
        if (row.status === 'Dispatched') {
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenCompleteModal(row)}
                className="flex items-center gap-1.5 text-success border-success/35 hover:bg-success/5 py-1 px-2 text-[10px] rounded-lg"
              >
                <CheckSquare size={11} />
                <span>Complete</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleCancel(row.id)}
                className="flex items-center gap-1.5 text-danger border-danger/35 hover:bg-danger/5 py-1 px-2 text-[10px] rounded-lg"
              >
                <XSquare size={11} />
                <span>Cancel</span>
              </Button>
            </div>
          );
        }
        return null;
      }
    }
  ];

  // Offline defaults mapping fallback simulation
  const defaultAvailableVehicles = [
    { id: 1, registrationNumber: 'TX-892-PL', name: 'Freightliner Cascadia', maxLoadCapacity: 15000, status: 'Available' },
    { id: 2, registrationNumber: 'FL-234-ZZ', name: 'Ford Transit 350', maxLoadCapacity: 3500, status: 'Available' }
  ];

  const defaultAvailableDrivers = [
    { id: 1, name: 'Marcus Webb', licenseNumber: 'DL-9082341', isLicenseExpired: false, status: 'Available' },
    { id: 2, name: 'Sarah Lin', licenseNumber: 'DL-3891022', isLicenseExpired: false, status: 'Available' },
    { id: 3, name: 'David Ross', licenseNumber: 'DL-1289012', isLicenseExpired: true, status: 'Available' }
  ];

  const defaultTrips = [
    { 
      id: 1, 
      source: 'Warehouse Alpha (Seattle)', 
      destination: 'Port of Tacoma', 
      plannedDistance: 45, 
      cargoWeight: 12000, 
      revenue: 15000, 
      status: 'Draft', 
      startOdometer: 12450,
      vehicle: { registrationNumber: 'TX-892-PL', name: 'Freightliner Cascadia' },
      driver: { name: 'Marcus Webb', licenseNumber: 'DL-9082341' }
    },
    { 
      id: 2, 
      source: 'DC 2 (Portland)', 
      destination: 'Logistics Hub 5', 
      plannedDistance: 120, 
      cargoWeight: 3000, 
      revenue: 22000, 
      status: 'Dispatched', 
      startOdometer: 5120,
      vehicle: { registrationNumber: 'FL-234-ZZ', name: 'Ford Transit 350' },
      driver: { name: 'Sarah Lin', licenseNumber: 'DL-3891022' }
    },
    { 
      id: 3, 
      source: 'Warehouse Alpha (Seattle)', 
      destination: 'South Center Mall', 
      plannedDistance: 25, 
      cargoWeight: 10000, 
      revenue: 8500, 
      status: 'Completed', 
      startOdometer: 12425,
      endOdometer: 12450,
      fuelConsumed: 12,
      fuelCost: 1100,
      vehicle: { registrationNumber: 'TX-892-PL', name: 'Freightliner Cascadia' },
      driver: { name: 'Marcus Webb', licenseNumber: 'DL-9082341' }
    }
  ];

  const displayTrips = trips.length > 0 ? trips : defaultTrips;
  const simulatedVehicles = availableVehicles.length > 0 ? availableVehicles : defaultAvailableVehicles;
  const simulatedDrivers = availableDrivers.length > 0 ? availableDrivers : defaultAvailableDrivers;

  // Filter list by summary cards
  const counts = {
    All: displayTrips.length,
    Draft: displayTrips.filter(t => t.status === 'Draft').length,
    Dispatched: displayTrips.filter(t => t.status === 'Dispatched').length,
    Completed: displayTrips.filter(t => t.status === 'Completed').length,
    Cancelled: displayTrips.filter(t => t.status === 'Cancelled').length
  };

  const simulatedVehiclesOptions = [
    { value: '', label: 'Select Available Vehicle...' },
    ...simulatedVehicles.map(v => ({ value: String(v.id), label: `${v.registrationNumber} - ${v.name} (Max: ${v.maxLoadCapacity} kg)` }))
  ];

  const simulatedDriversOptions = [
    { value: '', label: 'Select Available Driver...' },
    ...simulatedDrivers.map(d => ({ value: String(d.id), label: `${d.name} ${d.isLicenseExpired ? '(EXPIRED)' : ''}` }))
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 max-w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary uppercase tracking-wide">
              Trip Dispatcher
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Live trip deployment, vehicle mapping, and operational completions.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsDraftModalOpen(true)}
            className="flex items-center gap-2 py-2.5"
          >
            <Plus size={15} />
            <span>Create Trip</span>
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

        {/* Dispatch Summaries / Status Filters Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.keys(counts).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between gap-2 shadow-sm cursor-pointer
                ${statusFilter === status 
                  ? 'bg-primary border-primary text-white shadow-primary/10' 
                  : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt/40'
                }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {status === 'All' ? 'Total Dispatches' : `${status} Trips`}
              </span>
              <span className={`text-2xl font-extrabold leading-none ${statusFilter === status ? 'text-white' : 'text-text-primary'}`}>
                {counts[status]}
              </span>
            </button>
          ))}
        </div>

        {/* Table List Section */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Operational Telemetry Registry
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Overview of current logistics.
              </p>
            </div>

            {/* Filter Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search trip destination..."
                onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
                className="w-full bg-surface-alt border border-border text-text-primary text-xs rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-150 font-semibold"
              />
            </div>
          </div>

          <DataTable
            columns={tripColumns}
            data={displayTrips}
            loading={tripsLoading}
            searchQuery={searchQuery}
            searchKeys={['source', 'destination', 'id']}
            pageSize={5}
            emptyTitle="No Dispatch Records"
            emptyDescription="No logs matching active filters are found."
          />
        </div>
      </div>

      {/* Create Trip Draft Dialog Modal */}
      <Modal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        title="Draft Cargo Trip Dispatch"
      >
        <form onSubmit={handleCreateDraftSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Source Location"
              name="source"
              placeholder="e.g. Seattle Depot"
              value={tripForm.source}
              onChange={handleTripFormChange}
              error={formErrors.source}
              icon={MapPin}
              required
            />
            
            <Input
              label="Destination Location"
              name="destination"
              placeholder="e.g. Portland DC"
              value={tripForm.destination}
              onChange={handleTripFormChange}
              error={formErrors.destination}
              icon={Compass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Select Available Vehicle"
              options={availableVehicles.length > 0 ? [
                { value: '', label: 'Select Available Vehicle...' },
                ...availableVehicles.map(v => ({ value: String(v.id), label: `${v.registrationNumber} - ${v.name} (Max: ${v.maxLoadCapacity} kg)` }))
              ] : simulatedVehiclesOptions}
              value={tripForm.vehicleId}
              onChange={(e) => setTripForm({ ...tripForm, vehicleId: e.target.value })}
              error={formErrors.vehicleId}
              required
            />

            <Select
              label="Select Available Driver"
              options={availableDrivers.length > 0 ? [
                { value: '', label: 'Select Available Driver...' },
                ...availableDrivers.map(d => ({ value: String(d.id), label: `${d.name} ${d.isLicenseExpired ? '(EXPIRED)' : ''}` }))
              ] : simulatedDriversOptions}
              value={tripForm.driverId}
              onChange={(e) => setTripForm({ ...tripForm, driverId: e.target.value })}
              error={formErrors.driverId}
              required
            />
          </div>

          {/* Conditional Alerts */}
          {isWeightWarning && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/25 text-xs text-danger font-semibold flex gap-2 animate-fadeIn">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>⚠️ Cargo weight exceeds max vehicle capacity ({selectedVehicle.maxLoadCapacity} kg).</span>
            </div>
          )}

          {isDriverExpiredWarning && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/25 text-xs text-danger font-semibold flex gap-2 animate-fadeIn">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>❌ Cannot dispatch: Driver license is expired.</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Cargo Weight (kg)"
              name="cargoWeight"
              type="number"
              placeholder="e.g. 5000"
              value={tripForm.cargoWeight}
              onChange={handleTripFormChange}
              error={formErrors.cargoWeight}
              required
            />

            <Input
              label="Distance (km)"
              name="plannedDistance"
              type="number"
              placeholder="e.g. 150"
              value={tripForm.plannedDistance}
              onChange={handleTripFormChange}
              error={formErrors.plannedDistance}
              required
            />

            <Input
              label="Revenue (INR)"
              name="revenue"
              type="number"
              placeholder="e.g. 24000"
              value={tripForm.revenue}
              onChange={handleTripFormChange}
              error={formErrors.revenue}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDraftModalOpen(false)} className="py-2.5">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isWeightWarning || isDriverExpiredWarning}
              loading={submitting}
              className="py-2.5"
            >
              Draft Dispatch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Trip Completion Form Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Complete Trip Dispatch"
      >
        <form onSubmit={handleCompleteSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Please log final metrics to release vehicle <strong className="text-text-primary">#{completionForm.vehicleReg}</strong> and its driver.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold tracking-wider uppercase text-text-muted">
                Start Odometer Reading
              </label>
              <input
                type="number"
                value={completionForm.startOdometer}
                disabled
                className="w-full bg-surface-alt/55 border border-border/80 text-text-muted text-sm rounded-xl py-3.5 px-4 outline-none opacity-60 cursor-not-allowed"
              />
            </div>

            <Input
              label="Final Odometer Reading"
              type="number"
              placeholder={`e.g. ${parseFloat(completionForm.startOdometer) + 100}`}
              value={completionForm.endOdometer}
              onChange={(e) => setCompletionForm({ ...completionForm, endOdometer: e.target.value })}
              error={formErrors.endOdometer}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fuel Consumed (Liters)"
              type="number"
              placeholder="e.g. 45"
              value={completionForm.fuelConsumed}
              onChange={(e) => setCompletionForm({ ...completionForm, fuelConsumed: e.target.value })}
              error={formErrors.fuelConsumed}
              required
            />

            <Input
              label="Fuel Cost (INR)"
              type="number"
              placeholder="e.g. 4000"
              value={completionForm.fuelCost}
              onChange={(e) => setCompletionForm({ ...completionForm, fuelCost: e.target.value })}
              error={formErrors.fuelCost}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)} className="py-2.5">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="py-2.5 bg-success hover:bg-success/90 focus:ring-success/50"
            >
              Complete Trip
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default Trips;
