import { useEffect, useState, useTransition, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchKPIs, 
  fetchAnalytics, 
  logExpense, 
  downloadCSVReport,
  simulateData,
  clearStatus 
} from '../redux/dashboardSlice';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { 
  Coins, 
  Download, 
  Plus, 
  Search, 
  Truck, 
  Wrench, 
  AlertCircle,
  Activity,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const userRole = user?.role;

  const { 
    kpis, 
    analytics, 
    kpisLoading, 
    analyticsLoading, 
    expenseLoading,
    simulateLoading,
    error, 
    successMessage 
  } = useSelector((state) => state.dashboard);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Transition for search typing
  const [, startTransition] = useTransition();

  // Log Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    tripId: '',
    type: 'Toll',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Initial fetch of analytical data
    dispatch(fetchKPIs());
    dispatch(fetchAnalytics());
  }, [dispatch]);

  // Handle Log Expense submission
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!expenseForm.vehicleId) errors.vehicleId = 'Vehicle ID is required';
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }
    if (!expenseForm.date) errors.date = 'Expense date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const payload = {
      vehicleId: parseInt(expenseForm.vehicleId),
      type: expenseForm.type,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date
    };
    if (expenseForm.tripId) {
      payload.tripId = parseInt(expenseForm.tripId);
    }

    const result = await dispatch(logExpense(payload));
    if (logExpense.fulfilled.match(result)) {
      setIsExpenseModalOpen(false);
      setExpenseForm({
        vehicleId: '',
        tripId: '',
        type: 'Toll',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      dispatch(fetchAnalytics());
      dispatch(fetchKPIs());
      setTimeout(() => dispatch(clearStatus()), 3000);
    }
  };

  // CSV download trigger
  const handleCSVDownload = () => {
    dispatch(downloadCSVReport());
  };

  // Demo data simulation trigger
  const handleSimulate = async () => {
    const result = await dispatch(simulateData());
    if (simulateData.fulfilled.match(result)) {
      dispatch(fetchKPIs());
      dispatch(fetchAnalytics());
      setTimeout(() => dispatch(clearStatus()), 4000);
    }
  };

  // Map analytics list columns — fields match backend response
  const analyticsColumns = [
    { 
      key: 'id', 
      label: 'Vehicle ID', 
      sortable: true,
      render: (row) => <span className="font-bold text-text-primary">#{row.id}</span>
    },
    { 
      key: 'name', 
      label: 'Name / Type', 
      sortable: true, 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{row.name}</span>
          <span className="text-[10px] text-text-secondary">{row.type}</span>
        </div>
      )
    },
    { 
      key: 'registrationNumber', 
      label: 'Registration', 
      sortable: true,
      render: (row) => <Badge variant="neutral">{row.registrationNumber}</Badge>
    },
    { 
      key: 'totalDistance', 
      label: 'Total Distance', 
      sortable: true,
      render: (row) => <span>{parseFloat(row.totalDistance ?? 0).toLocaleString()} km</span>
    },
    { 
      key: 'fuelEfficiency', 
      label: 'Fuel Efficiency', 
      sortable: true,
      render: (row) => <span>{parseFloat(row.fuelEfficiency ?? 0).toFixed(2)} km/L</span>
    },
    { 
      key: 'netProfit', 
      label: 'Net Profit', 
      sortable: true,
      render: (row) => {
        const val = parseFloat(row.netProfit ?? 0);
        return (
          <span className={`font-bold ${val >= 0 ? 'text-success' : 'text-danger'}`}>
            ₹{val.toLocaleString()}
          </span>
        );
      }
    },
    { 
      key: 'roi', 
      label: 'ROI %', 
      sortable: true,
      render: (row) => {
        const val = parseFloat(row.roi ?? 0);
        return (
          <span className={`font-bold ${val >= 0 ? 'text-success' : 'text-danger'}`}>
            {val >= 0 ? '+' : ''}{val.toFixed(1)}%
          </span>
        );
      }
    }
  ];

  // Helper values for offline display simulation
  const defaultKPIs = {
    activeVehicles: kpis.activeVehicles || 8,
    availableVehicles: kpis.availableVehicles || 24,
    vehiclesInMaintenance: kpis.vehiclesInMaintenance || 3,
    activeTrips: kpis.activeTrips || 6,
    pendingTrips: kpis.pendingTrips || 2,
    driversOnDuty: kpis.driversOnDuty || 8,
    fleetUtilization: kpis.fleetUtilization || 25,
  };

  const defaultAnalytics = analytics.length > 0 ? analytics : [
    { id: 1, name: 'Volvo FMX', type: 'Truck', registrationNumber: 'MH-12-TR-9981', totalDistance: 350.5, fuelEfficiency: 3.19, netProfit: 72750, roi: 1.62 },
    { id: 2, name: 'BharatBenz 2823C', type: 'Truck', registrationNumber: 'MH-12-TR-9982', totalDistance: 0, fuelEfficiency: 0, netProfit: 0, roi: 0 },
    { id: 3, name: 'Tata Winger', type: 'Van', registrationNumber: 'DL-01-VN-4412', totalDistance: 0, fuelEfficiency: 0, netProfit: -25000, roi: -2.08 },
    { id: 4, name: 'Maruti Suzuki Eeco', type: 'Car', registrationNumber: 'KA-03-CR-2210', totalDistance: 0, fuelEfficiency: 0, netProfit: 0, roi: 0 },
  ];

  const canManageFinance = userRole === 'Fleet Manager' || userRole === 'Financial Analyst';

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 max-w-full">
        {/* Page Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary uppercase tracking-wide">
              Operations Center
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Live fleet orchestration and logistical performance metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Fleet Manager only: Load Demo Data */}
            {userRole === 'Fleet Manager' && (
              <Button 
                variant="outline"
                onClick={handleSimulate}
                loading={simulateLoading}
                className="flex items-center gap-2 border-primary/40 text-primary hover:bg-primary/10 py-2.5"
              >
                <Zap size={15} />
                <span>Load Demo Data</span>
              </Button>
            )}

            {/* Fleet Manager & Financial Analyst: CSV + Expense */}
            {canManageFinance && (
              <Button 
                variant="outline"
                onClick={handleCSVDownload}
                className="flex items-center gap-2 border-border text-text-primary hover:bg-surface-alt py-2.5"
              >
                <Download size={15} />
                <span>Export CSV</span>
              </Button>
            )}
            
            {canManageFinance && (
              <Button
                variant="primary"
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-2 py-2.5"
              >
                <Plus size={15} />
                <span>Log Expense</span>
              </Button>
            )}
          </div>
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

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card 
            title="Fleet Utilization" 
            value={`${defaultKPIs.fleetUtilization}%`}
            icon={Activity}
            trend={`${defaultKPIs.activeVehicles} Active Vehicles`}
            trendType="positive"
            loading={kpisLoading}
          >
            <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted font-semibold uppercase">
              <span>{defaultKPIs.activeVehicles} Active Vehicles</span>
              <span>•</span>
              <span>{defaultKPIs.driversOnDuty} Drivers Duty</span>
            </div>
          </Card>

          <Card 
            title="Available Fleet" 
            value={defaultKPIs.availableVehicles}
            icon={Truck}
            trend="Stable ready status"
            trendType="neutral"
            loading={kpisLoading}
          >
            <div className="mt-3 text-[10px] text-text-muted font-semibold uppercase">
              Available transit capacity
            </div>
          </Card>

          <Card 
            title="Maintenance Shop" 
            value={defaultKPIs.vehiclesInMaintenance}
            icon={Wrench}
            trend="Vehicles under repair"
            trendType={defaultKPIs.vehiclesInMaintenance > 0 ? 'warning' : 'positive'}
            loading={kpisLoading}
          >
            <div className="mt-3 text-[10px] text-text-muted font-semibold uppercase">
              Undergoing diagnostics
            </div>
          </Card>

          <Card 
            title="Active / Pending Jobs" 
            value={`${defaultKPIs.activeTrips} / ${defaultKPIs.pendingTrips}`}
            icon={Coins}
            trend="Active scheduling load"
            trendType="neutral"
            loading={kpisLoading}
          >
            <div className="mt-3 text-[10px] text-text-muted font-semibold uppercase">
              Dispatched vs draft trips
            </div>
          </Card>
        </div>

        {/* Fleet ROI & Performance Table */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Fleet Performance & ROI
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Financial return rates and fuel efficacy indicators.
              </p>
            </div>

            {/* Filter Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search fleet metrics..."
                onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
                className="w-full bg-surface-alt border border-border text-text-primary text-xs rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-150 font-semibold"
              />
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={analyticsColumns}
            data={defaultAnalytics}
            loading={analyticsLoading}
            searchQuery={searchQuery}
            searchKeys={['name', 'registrationNumber', 'type']}
            pageSize={5}
            emptyTitle="No Vehicle Analytics Found"
            emptyDescription="Run 'Load Demo Data' to populate the analytics or complete some trips."
          />
        </div>
      </div>

      {/* Log Expense Dialog Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Log Fleet Expense"
      >
        <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-4">
          <Input
            label="Vehicle ID"
            type="number"
            placeholder="e.g. 1"
            value={expenseForm.vehicleId}
            onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
            error={formErrors.vehicleId}
            required
          />

          <Input
            label="Trip ID (Optional)"
            type="number"
            placeholder="e.g. 3"
            value={expenseForm.tripId}
            onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
          />

          <Select
            label="Expense Category"
            options={[
              { value: 'Toll', label: 'Tolls & Telemetry Gates' },
              { value: 'Other', label: 'Miscellaneous Invoices' }
            ]}
            value={expenseForm.type}
            onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
            required
          />

          <Input
            label="Expense Amount (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 250.00"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            error={formErrors.amount}
            required
          />

          <Input
            label="Date of Transaction"
            type="date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
            error={formErrors.date}
            required
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsExpenseModalOpen(false)}
              className="py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={expenseLoading}
              className="py-2.5"
            >
              Submit Expense
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default Dashboard;
