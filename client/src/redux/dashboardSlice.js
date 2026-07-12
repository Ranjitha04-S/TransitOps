import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to fetch Dashboard KPIs
export const fetchKPIs = createAsyncThunk(
  'dashboard/fetchKPIs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/dashboard/kpis');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard KPIs'
      );
    }
  }
);

// Thunk to fetch Dashboard Fleet Analytics
export const fetchAnalytics = createAsyncThunk(
  'dashboard/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/dashboard/analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch fleet analytics'
      );
    }
  }
);

// Thunk to log a Toll/Misc Expense
export const logExpense = createAsyncThunk(
  'dashboard/logExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to log expense'
      );
    }
  }
);

// Thunk to download CSV Report
export const downloadCSVReport = createAsyncThunk(
  'dashboard/downloadCSVReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/reports/csv', {
        responseType: 'blob',
      });
      // Create element link to trigger attachment download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'TransitOps_Trip_Report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to export CSV report'
      );
    }
  }
);

const initialState = {
  kpis: {
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0,
  },
  analytics: [],
  kpisLoading: false,
  analyticsLoading: false,
  expenseLoading: false,
  error: null,
  successMessage: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch KPIs
      .addCase(fetchKPIs.pending, (state) => {
        state.kpisLoading = true;
        state.error = null;
      })
      .addCase(fetchKPIs.fulfilled, (state, action) => {
        state.kpisLoading = false;
        const payload = action.payload || {};
        state.kpis = {
          activeVehicles: payload.activeVehicles ?? payload.active_vehicles ?? 0,
          availableVehicles: payload.availableVehicles ?? payload.available_vehicles ?? 0,
          vehiclesInMaintenance: payload.vehiclesInMaintenance ?? payload.vehicles_in_maintenance ?? payload.maintenanceVehicles ?? payload.maintenance_vehicles ?? 0,
          activeTrips: payload.activeTrips ?? payload.active_trips ?? 0,
          pendingTrips: payload.pendingTrips ?? payload.pending_trips ?? 0,
          driversOnDuty: payload.driversOnDuty ?? payload.drivers_on_duty ?? 0,
          fleetUtilization: payload.fleetUtilization ?? payload.fleet_utilization ?? 0,
        };
      })
      .addCase(fetchKPIs.rejected, (state, action) => {
        state.kpisLoading = false;
        state.error = action.payload;
      })

      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload?.analytics ?? (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      })

      // Log Expense
      .addCase(logExpense.pending, (state) => {
        state.expenseLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(logExpense.fulfilled, (state) => {
        state.expenseLoading = false;
        state.successMessage = 'Expense logged successfully!';
      })
      .addCase(logExpense.rejected, (state, action) => {
        state.expenseLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStatus } = dashboardSlice.actions;
export default dashboardSlice.reducer;
