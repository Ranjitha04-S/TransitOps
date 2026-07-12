import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all maintenance logs
export const fetchMaintenanceLogs = createAsyncThunk(
  'maintenance/fetchMaintenanceLogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/maintenance');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch maintenance logs'
      );
    }
  }
);

// Fetch all vehicles for the maintenance dropdown selection list
export const fetchVehicles = createAsyncThunk(
  'maintenance/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/vehicles');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch vehicle list'
      );
    }
  }
);

// Create a maintenance log entry
export const createMaintenanceLog = createAsyncThunk(
  'maintenance/createMaintenanceLog',
  async (logData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/maintenance', logData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create maintenance log entry'
      );
    }
  }
);

// Close an active maintenance log
export const closeMaintenanceLog = createAsyncThunk(
  'maintenance/closeMaintenanceLog',
  async ({ logId, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/maintenance/${logId}/close`, { endDate });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to close maintenance log'
      );
    }
  }
);

const initialState = {
  logs: [],
  vehicles: [],
  logsLoading: false,
  vehiclesLoading: false,
  submitting: false,
  error: null,
  successMessage: null,
};

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    clearMaintenanceStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Logs
      .addCase(fetchMaintenanceLogs.pending, (state) => {
        state.logsLoading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceLogs.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.logs = action.payload?.logs ?? [];
      })
      .addCase(fetchMaintenanceLogs.rejected, (state, action) => {
        state.logsLoading = false;
        state.error = action.payload;
      })

      // Fetch Vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.vehiclesLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.vehiclesLoading = false;
        state.vehicles = action.payload?.vehicles ?? [];
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.vehiclesLoading = false;
        state.error = action.payload;
      })

      // Create Entry
      .addCase(createMaintenanceLog.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createMaintenanceLog.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Maintenance record created successfully!';
      })
      .addCase(createMaintenanceLog.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Close Entry
      .addCase(closeMaintenanceLog.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(closeMaintenanceLog.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Maintenance log closed and vehicle returned to available service!';
      })
      .addCase(closeMaintenanceLog.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearMaintenanceStatus } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
