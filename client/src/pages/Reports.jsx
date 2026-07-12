import { useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, downloadCSVReport } from '../redux/dashboardSlice';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { Download, TrendingUp, Fuel, BarChart2 } from 'lucide-react';

const Reports = () => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const userRole = user?.role;

  const { analytics, analyticsLoading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const handleCSVDownload = () => {
    dispatch(downloadCSVReport());
  };

  const displayData = analytics.length > 0 ? analytics : [
    { id: 1, name: 'Volvo FMX', type: 'Truck', registrationNumber: 'MH-12-TR-9981', totalRevenue: 97500, totalExpenses: 24750, netProfit: 72750, roi: 1.62, totalDistance: 350.5, totalFuelConsumed: 109.87, fuelEfficiency: 3.19, totalTrips: 3 },
    { id: 2, name: 'BharatBenz 2823C', type: 'Truck', registrationNumber: 'MH-12-TR-9982', totalRevenue: 0, totalExpenses: 350, netProfit: -350, roi: -0.01, totalDistance: 0, totalFuelConsumed: 0, fuelEfficiency: 0, totalTrips: 0 },
    { id: 3, name: 'Tata Winger', type: 'Van', registrationNumber: 'DL-01-VN-4412', totalRevenue: 0, totalExpenses: 1200, netProfit: -1200, roi: -0.10, totalDistance: 0, totalFuelConsumed: 0, fuelEfficiency: 0, totalTrips: 0 },
    { id: 4, name: 'Maruti Suzuki Eeco', type: 'Car', registrationNumber: 'KA-03-CR-2210', totalRevenue: 0, totalExpenses: 0, netProfit: 0, roi: 0, totalDistance: 0, totalFuelConsumed: 0, fuelEfficiency: 0, totalTrips: 0 },
  ];

  // Summary stats
  const totalRevenue = displayData.reduce((s, r) => s + parseFloat(r.totalRevenue || 0), 0);
  const totalProfit = displayData.reduce((s, r) => s + parseFloat(r.netProfit || 0), 0);
  const totalDistance = displayData.reduce((s, r) => s + parseFloat(r.totalDistance || 0), 0);
  const avgROI = displayData.length > 0
    ? (displayData.reduce((s, r) => s + parseFloat(r.roi || 0), 0) / displayData.length).toFixed(2)
    : '0.00';

  const columns = [
    {
      key: 'registrationNumber',
      label: 'Vehicle',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary">{row.registrationNumber}</span>
          <span className="text-[10px] text-text-secondary">{row.name} — {row.type}</span>
        </div>
      )
    },
    {
      key: 'totalTrips',
      label: 'Total Trips',
      sortable: true,
      render: (row) => <Badge variant="neutral">{row.totalTrips ?? 0} trips</Badge>
    },
    {
      key: 'totalDistance',
      label: 'Distance (km)',
      sortable: true,
      render: (row) => <span>{parseFloat(row.totalDistance ?? 0).toLocaleString()} km</span>
    },
    {
      key: 'fuelEfficiency',
      label: 'Fuel Efficiency',
      sortable: true,
      render: (row) => {
        const val = parseFloat(row.fuelEfficiency ?? 0);
        const color = val > 3 ? 'text-success' : val > 0 ? 'text-warning' : 'text-text-muted';
        return <span className={`font-semibold ${color}`}>{val.toFixed(2)} km/L</span>;
      }
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      sortable: true,
      render: (row) => <span className="text-success font-semibold">₹{parseFloat(row.totalRevenue ?? 0).toLocaleString()}</span>
    },
    {
      key: 'totalExpenses',
      label: 'Expenses',
      sortable: true,
      render: (row) => <span className="text-danger font-semibold">₹{parseFloat(row.totalExpenses ?? 0).toLocaleString()}</span>
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
          <span className={`font-bold text-sm ${val >= 0 ? 'text-success' : 'text-danger'}`}>
            {val >= 0 ? '+' : ''}{val.toFixed(2)}%
          </span>
        );
      }
    }
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary uppercase tracking-wide">
              Reports & Analytics
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Fleet-wide financial returns, fuel performance, and operational summaries.
            </p>
          </div>

          {/* Only Fleet Manager & Financial Analyst can download CSV */}
          {(userRole === 'Fleet Manager' || userRole === 'Financial Analyst') && (
            <Button
              variant="outline"
              onClick={handleCSVDownload}
              className="flex items-center gap-2 border-border text-text-primary hover:bg-surface-alt py-2.5"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </Button>
          )}
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-lg bg-success/10">
              <TrendingUp size={20} className="text-success" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-semibold uppercase">Total Revenue</p>
              <p className="text-lg font-extrabold text-text-primary">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-lg bg-primary/10">
              <BarChart2 size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-semibold uppercase">Net Profit</p>
              <p className={`text-lg font-extrabold ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{totalProfit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-lg bg-info/10">
              <Fuel size={20} className="text-info" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-semibold uppercase">Total Distance</p>
              <p className="text-lg font-extrabold text-text-primary">{totalDistance.toLocaleString()} km</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-lg ${parseFloat(avgROI) >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
              <TrendingUp size={20} className={parseFloat(avgROI) >= 0 ? 'text-success' : 'text-danger'} />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-semibold uppercase">Avg Fleet ROI</p>
              <p className={`text-lg font-extrabold ${parseFloat(avgROI) >= 0 ? 'text-success' : 'text-danger'}`}>
                {parseFloat(avgROI) >= 0 ? '+' : ''}{avgROI}%
              </p>
            </div>
          </div>
        </div>

        {/* Per-Vehicle Analytics Table */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              Per-Vehicle Financial Report
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              ROI, revenue, expense breakdown and fuel performance per asset.
            </p>
          </div>
          <DataTable
            columns={columns}
            data={displayData}
            loading={analyticsLoading}
            pageSize={8}
            emptyTitle="No Analytics Data"
            emptyDescription="Complete some trips or load demo data from the Dashboard to see analytics."
          />
        </div>

        {/* ROI Visual Bar Chart */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-5">
            ROI Performance per Vehicle
          </h3>
          <div className="flex flex-col gap-3">
            {displayData.map((row) => {
              const roi = parseFloat(row.roi ?? 0);
              const maxROI = Math.max(...displayData.map(r => Math.abs(parseFloat(r.roi ?? 0))), 1);
              const barWidth = Math.abs(roi) / maxROI * 100;
              const isPositive = roi >= 0;
              return (
                <div key={row.id} className="flex items-center gap-3">
                  <div className="w-32 text-[11px] font-semibold text-text-secondary truncate shrink-0">
                    {row.registrationNumber}
                  </div>
                  <div className="flex-1 h-5 bg-surface-alt rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isPositive ? 'bg-success' : 'bg-danger'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className={`w-16 text-right text-xs font-bold shrink-0 ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : ''}{roi.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
