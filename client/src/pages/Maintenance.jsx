import { useEffect, useState, useTransition, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMaintenanceLogs, 
  fetchVehicles, 
  createMaintenanceLog, 
  closeMaintenanceLog,
  clearMaintenanceStatus 
} from '../redux/maintenanceSlice';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { Plus, Search, Calendar, CheckSquare, AlertTriangle, AlertCircle } from 'lucide-react';

const Maintenance = () => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const userRole = user?.role;
  const isFleetManager = userRole === 'Fleet Manager';

  const { 
    logs, 
    vehicles, 
    logsLoading, 
    submitting, 
    error, 
    successMessage 
  } = useSelector((state) => state.maintenance);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');
  const [, startTransition] = useTransition();

  // Dialog/Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Forms states
  const [logForm, setLogForm] = useState({
    vehicleId: '',
    description: '',
    cost: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [closeForm, setCloseForm] = useState({
    logId: null,
    vehicleReg: '',
    endDate: new Date().toISOString().split('T')[0]
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchMaintenanceLogs());
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Selected vehicle state watcher to trigger warning alerts
  const selectedVehicle = vehicles.find(v => String(v.id) === String(logForm.vehicleId));
  const isSelectedVehicleOnTrip = selectedVehicle && selectedVehicle.status === 'On Trip';

  // Handle Create Log Submission
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (isSelectedVehicleOnTrip) return;

    const errors = {};
    if (!logForm.vehicleId) errors.vehicleId = 'Vehicle selection is required';
    if (!logForm.description.trim()) errors.description = 'Description is required';
    if (!logForm.cost || parseFloat(logForm.cost) < 0) {
      errors.cost = 'Repair cost must be a positive number';
    }
    if (!logForm.startDate) errors.startDate = 'Start date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const payload = {
      vehicleId: parseInt(logForm.vehicleId),
      description: logForm.description,
      cost: parseFloat(logForm.cost),
      startDate: logForm.startDate
    };

    const result = await dispatch(createMaintenanceLog(payload));
    if (createMaintenanceLog.fulfilled.match(result)) {
      setIsLogModalOpen(false);
      setLogForm({
        vehicleId: '',
        description: '',
        cost: '',
        startDate: new Date().toISOString().split('T')[0]
      });
      dispatch(fetchMaintenanceLogs());
      dispatch(fetchVehicles());
      setTimeout(() => {
        dispatch(clearMaintenanceStatus());
      }, 3000);
    }
  };

  // Launch Close Log Dialog
  const handleOpenCloseModal = (row) => {
    const regNum = row.vehicle?.registrationNumber ?? row.registrationNumber ?? 'Unknown';
    setCloseForm({
      logId: row.id,
      vehicleReg: regNum,
      endDate: new Date().toISOString().split('T')[0]
    });
    setIsCloseModalOpen(true);
  };

  // Submit Close Log Submission
  const handleCloseSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(closeMaintenanceLog({
      logId: closeForm.logId,
      endDate: closeForm.endDate
    }));

    if (closeMaintenanceLog.fulfilled.match(result)) {
      setIsCloseModalOpen(false);
      dispatch(fetchMaintenanceLogs());
      dispatch(fetchVehicles());
      setTimeout(() => {
        dispatch(clearMaintenanceStatus());
      }, 3000);
    }
  };

  // Options map for vehicle selection
  const vehicleOptions = [
    { value: '', label: 'Select a vehicle for repair...' },
    ...vehicles.map(v => ({
      value: String(v.id),
      label: `${v.registrationNumber} - ${v.name} (${v.status})`
    }))
  ];

  // Map Maintenance Log Columns
  const logColumns = [
    {
      key: 'registrationNumber',
      label: 'Vehicle (Reg Number)',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary">
            {row.vehicle?.registrationNumber ?? row.registrationNumber ?? 'Unknown'}
          </span>
          <span className="text-[10px] text-text-secondary">
            {row.vehicle?.name ?? row.vehicleName ?? 'Volvo FH16'}
          </span>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (row) => (
        <p className="text-xs text-text-secondary line-clamp-2 max-w-md font-medium leading-relaxed">
          {row.description}
        </p>
      )
    },
    {
      key: 'cost',
      label: 'Cost (INR)',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-text-primary">
          ₹{parseFloat(row.cost).toLocaleString()}
        </span>
      )
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Calendar size={13} />
          <span>{row.startDate}</span>
        </div>
      )
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Calendar size={13} />
          <span>{row.endDate || '-'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const isActive = row.status === 'Active';
        return (
          <Badge variant={isActive ? 'warning' : 'neutral'} className={isActive ? 'animate-pulse' : ''}>
            {isActive ? 'In Shop' : 'Closed'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => {
        if (!isFleetManager) return <span className="text-text-muted text-xs">View Only</span>;
        if (row.status !== 'Active') return null;
        return (
          <Button
            variant="outline"
            onClick={() => handleOpenCloseModal(row)}
            className="flex items-center gap-1.5 text-success border-success/35 hover:bg-success/5 hover:text-success py-1.5 px-3 rounded-lg text-[10px]"
          >
            <CheckSquare size={12} />
            <span>Close Log</span>
          </Button>
        );
      }
    }
  ];

  // Helper values for offline simulation
  const defaultVehicles = [
    { id: 1, registrationNumber: 'TX-892-PL', name: 'Freightliner Cascadia', status: 'Available' },
    { id: 2, registrationNumber: 'CA-481-QA', name: 'Volvo VNL 860', status: 'On Trip' },
    { id: 3, registrationNumber: 'NY-992-XD', name: 'Peterbilt 579', status: 'In Shop' },
    { id: 4, registrationNumber: 'FL-234-ZZ', name: 'Kenworth T680', status: 'Available' }
  ];

  const defaultLogs = [
    { 
      id: 1, 
      registrationNumber: 'NY-992-XD', 
      vehicleName: 'Peterbilt 579', 
      description: 'Engine transmission overhaul and coolant radiator flush', 
      cost: 12500, 
      startDate: '2026-07-10', 
      endDate: null, 
      status: 'Active',
      vehicle: { registrationNumber: 'NY-992-XD', name: 'Peterbilt 579' }
    },
    { 
      id: 2, 
      registrationNumber: 'FL-234-ZZ', 
      vehicleName: 'Kenworth T680', 
      description: 'Front brake pads replaced and tire alignment checks', 
      cost: 4500, 
      startDate: '2026-07-01', 
      endDate: '2026-07-03', 
      status: 'Closed',
      vehicle: { registrationNumber: 'FL-234-ZZ', name: 'Kenworth T680' }
    }
  ];

  const displayLogs = logs.length > 0 ? logs : defaultLogs;
  const simulatedVehicles = vehicles.length > 0 ? vehicles : defaultVehicles;

  const simulatedVehicleOptions = [
    { value: '', label: 'Select a vehicle for repair...' },
    ...simulatedVehicles.map(v => ({
      value: String(v.id),
      label: `${v.registrationNumber} - ${v.name} (${v.status})`
    }))
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 max-w-full animate-fadeIn">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary uppercase tracking-wide">
              Maintenance Log
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Record active repairs and check historical fleet workshop details.
            </p>
          </div>

          {isFleetManager && (
            <Button
              variant="primary"
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-2 py-2.5"
            >
              <Plus size={15} />
              <span>Log Maintenance</span>
            </Button>
          )}
        </div>

        {/* Global Success / Alert Banner */}
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

        {/* Table List Section */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Fleet Diagnostics Registry
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Current and closed repair logs.
              </p>
            </div>

            {/* Filter Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search diagnostic description..."
                onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
                className="w-full bg-surface-alt border border-border text-text-primary text-xs rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-150 font-semibold"
              />
            </div>
          </div>

          <DataTable
            columns={logColumns}
            data={displayLogs}
            loading={logsLoading}
            searchQuery={searchQuery}
            searchKeys={['description', 'registrationNumber']}
            pageSize={5}
            emptyTitle="No Maintenance Entries"
            emptyDescription="We couldn't retrieve or filter the diagnostics logs array."
          />
        </div>
      </div>

      {/* Log Maintenance Entry Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Vehicle Maintenance"
      >
        <form onSubmit={handleLogSubmit} className="flex flex-col gap-4">
          <Select
            label="Select Active Vehicle"
            options={vehicles.length > 0 ? vehicleOptions : simulatedVehicleOptions}
            value={logForm.vehicleId}
            onChange={(e) => setLogForm({ ...logForm, vehicleId: e.target.value })}
            error={formErrors.vehicleId}
            required
          />

          {/* Conditional Alert Warning if selected vehicle is deployed */}
          {isSelectedVehicleOnTrip && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/25 text-xs text-danger font-medium flex gap-2.5 items-start animate-fadeIn">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>
                <strong>⚠️ Deployed Status Alert:</strong> This vehicle is currently deployed on an active trip and cannot be placed in maintenance.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold tracking-wider uppercase text-text-secondary flex items-center gap-1">
              Repair Description
              <span className="text-primary">*</span>
            </label>
            <textarea
              placeholder="e.g. Replacements of rear brake pads, cooling systems inspection, or radiator core flushes..."
              value={logForm.description}
              onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
              required
              rows={4}
              className={`w-full bg-surface-alt border text-text-primary text-sm rounded-xl py-3 px-4 outline-none transition-all duration-200 resize-none
                ${formErrors.description 
                  ? 'border-danger/80 focus:border-danger focus:ring-1 focus:ring-danger/20' 
                  : 'border-border focus:border-primary focus:ring-1 focus:ring-primary/20'
                }`}
            />
            {formErrors.description && (
              <span className="text-[11px] text-danger font-medium mt-0.5 animate-pulse">
                {formErrors.description}
              </span>
            )}
          </div>

          <Input
            label="Repair Cost (INR)"
            type="number"
            placeholder="e.g. 8500"
            value={logForm.cost}
            onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
            error={formErrors.cost}
            required
          />

          <Input
            label="Start Date of Repair"
            type="date"
            value={logForm.startDate}
            onChange={(e) => setLogForm({ ...logForm, startDate: e.target.value })}
            error={formErrors.startDate}
            required
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsLogModalOpen(false)}
              className="py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSelectedVehicleOnTrip}
              loading={submitting}
              className="py-2.5"
            >
              Log Vehicle Repair
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Maintenance Confirmation Modal */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Close Diagnostics Log"
      >
        <form onSubmit={handleCloseSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Please record the completion date for vehicle <strong className="text-text-primary">#{closeForm.vehicleReg}</strong>. This log entry status will update to <strong className="text-text-primary">Closed</strong>, and the vehicle status will return to <strong className="text-success">Available</strong>.
          </p>

          <Input
            label="End Date of Repair"
            type="date"
            value={closeForm.endDate}
            onChange={(e) => setCloseForm({ ...closeForm, endDate: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCloseModalOpen(false)}
              className="py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="py-2.5 bg-success hover:bg-success/90 focus:ring-success/50"
            >
              Complete Repair
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default Maintenance;
