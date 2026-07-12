import { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logExpense, fetchAnalytics } from '../redux/dashboardSlice';
import { fetchVehiclesList } from '../redux/registriesSlice';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { Plus, AlertCircle, Coins } from 'lucide-react';

// Local expenses slice — if not created, use dashboard's logExpense + a local GET thunk
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Inline thunk for fetching expenses list
const fetchExpensesList = async () => {
  const response = await axios.get('/expenses');
  return response.data;
};

const Expenses = () => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const userRole = user?.role;

  const { vehicles } = useSelector((state) => state.registries);
  const { expenseLoading, error, successMessage } = useSelector((state) => state.dashboard);

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    tripId: '',
    type: 'Toll',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch expenses and vehicles on mount
  useEffect(() => {
    setExpensesLoading(true);
    fetchExpensesList()
      .then(data => setExpenses(data?.expenses ?? []))
      .catch(() => setExpenses([]))
      .finally(() => setExpensesLoading(false));
    
    dispatch(fetchVehiclesList({}));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!expenseForm.vehicleId) errors.vehicleId = 'Vehicle selection is required';
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }
    if (!expenseForm.date) errors.date = 'Date is required';

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
    if (expenseForm.tripId) payload.tripId = parseInt(expenseForm.tripId);

    const result = await dispatch(logExpense(payload));
    if (logExpense.fulfilled.match(result)) {
      setIsModalOpen(false);
      setExpenseForm({
        vehicleId: '',
        tripId: '',
        type: 'Toll',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      // Refresh expenses list
      setExpensesLoading(true);
      fetchExpensesList()
        .then(data => setExpenses(data?.expenses ?? []))
        .catch(() => {})
        .finally(() => setExpensesLoading(false));
    }
  };

  const vehicleOptions = [
    { value: '', label: 'Select a Vehicle...' },
    ...vehicles.map(v => ({ value: String(v.id), label: `${v.registrationNumber} — ${v.name}` }))
  ];

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (row) => <span className="font-bold text-text-primary">#{row.id}</span>
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      sortable: false,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">
            {row.vehicle?.registrationNumber ?? `Vehicle #${row.vehicleId}`}
          </span>
          <span className="text-[10px] text-text-secondary">{row.vehicle?.name}</span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => {
        const colors = { Toll: 'info', Other: 'neutral' };
        return <Badge variant={colors[row.type] || 'neutral'}>{row.type}</Badge>;
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => <span className="font-bold text-text-primary">₹{parseFloat(row.amount).toLocaleString()}</span>
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => <span className="text-text-secondary">{row.date}</span>
    },
    {
      key: 'tripId',
      label: 'Linked Trip',
      sortable: false,
      render: (row) => row.tripId 
        ? <Badge variant="info">#TR-{row.tripId}</Badge> 
        : <span className="text-text-muted text-xs">—</span>
    }
  ];

  // Fallback demo data
  const defaultExpenses = expenses.length > 0 ? expenses : [
    { id: 1, vehicleId: 1, vehicle: { registrationNumber: 'MH-12-TR-9981', name: 'Volvo FMX' }, type: 'Toll', amount: 500, date: '2026-07-10', tripId: 1 },
    { id: 2, vehicleId: 2, vehicle: { registrationNumber: 'MH-12-TR-9982', name: 'BharatBenz 2823C' }, type: 'Toll', amount: 350, date: '2026-07-09', tripId: null },
    { id: 3, vehicleId: 3, vehicle: { registrationNumber: 'DL-01-VN-4412', name: 'Tata Winger' }, type: 'Other', amount: 1200, date: '2026-07-08', tripId: null },
  ];

  const totalAmount = defaultExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary uppercase tracking-wide">
              Fuel & Expenses
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Track tolls, surcharges, and miscellaneous operating costs.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 py-2.5"
          >
            <Plus size={15} />
            <span>Log Expense</span>
          </Button>
        </div>

        {/* Total Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-lg bg-primary/10">
              <Coins size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-semibold uppercase">Total Expenses</p>
              <p className="text-xl font-extrabold text-text-primary">₹{totalAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-lg bg-info/10">
              <Coins size={20} className="text-info" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-semibold uppercase">Total Records</p>
              <p className="text-xl font-extrabold text-text-primary">{defaultExpenses.length}</p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-lg bg-success/10">
              <Coins size={20} className="text-success" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-semibold uppercase">Toll Expenses</p>
              <p className="text-xl font-extrabold text-text-primary">
                ₹{defaultExpenses.filter(e => e.type === 'Toll').reduce((s, e) => s + parseFloat(e.amount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-danger/15 border border-danger/35 text-xs text-danger font-semibold flex items-center gap-2.5">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-4 rounded-xl bg-success/15 border border-success/35 text-xs text-success font-semibold flex items-center gap-2.5">
            <Badge variant="success">Notice</Badge>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Expenses Table */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-4">
            Expense Ledger
          </h3>
          <DataTable
            columns={columns}
            data={defaultExpenses}
            loading={expensesLoading}
            pageSize={8}
            emptyTitle="No Expenses Logged"
            emptyDescription="Log a new expense using the button above."
          />
        </div>
      </div>

      {/* Log Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Fleet Expense"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Vehicle"
            options={vehicleOptions}
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
            label="Expense Type"
            options={[
              { value: 'Toll', label: 'Toll / Highway Fee' },
              { value: 'Other', label: 'Other / Miscellaneous' }
            ]}
            value={expenseForm.type}
            onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
            required
          />

          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 500.00"
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="py-2.5">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={expenseLoading} className="py-2.5">
              Submit Expense
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default Expenses;
