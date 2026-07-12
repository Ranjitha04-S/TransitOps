import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch vehicles with filter queries
export const fetchVehiclesList = createAsyncThunk(
  'registries/fetchVehiclesList',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'All') params.append('type', filters.type);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.region && filters.region !== 'All') params.append('region', filters.region);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/vehicles?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch vehicles list'
      );
    }
  }
);

// Add a vehicle to the registry
export const addVehicle = createAsyncThunk(
  'registries/addVehicle',
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to register vehicle'
      );
    }
  }
);

// Fetch drivers with search & status filter queries
export const fetchDriversList = createAsyncThunk(
  'registries/fetchDriversList',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/drivers?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch drivers list'
      );
    }
  }
);

// Add a driver to the registry
export const addDriver = createAsyncThunk(
  'registries/addDriver',
  async (driverData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/drivers', driverData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to register driver'
      );
    }
  }
);

const initialState = {
  vehicles: [],
  drivers: [],
  vehiclesLoading: false,
  driversLoading: false,
  submitting: false,
  error: null,
  successMessage: null,
};

const registriesSlice = createSlice({
  name: 'registries',
  initialState,
  reducers: {
    clearRegistryStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vehicles
      .addCase(fetchVehiclesList.pending, (state) => {
        state.vehiclesLoading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesList.fulfilled, (state, action) => {
        state.vehiclesLoading = false;
        state.vehicles = action.payload?.vehicles ?? [];
      })
      .addCase(fetchVehiclesList.rejected, (state, action) => {
        state.vehiclesLoading = false;
        state.error = action.payload;
      })

      // Add Vehicle
      .addCase(addVehicle.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addVehicle.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Vehicle successfully registered in system!';
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Fetch Drivers
      .addCase(fetchDriversList.pending, (state) => {
        state.driversLoading = true;
        state.error = null;
      })
      .addCase(fetchDriversList.fulfilled, (state, action) => {
        state.driversLoading = false;
        state.drivers = action.payload?.drivers ?? [];
      })
      .addCase(fetchDriversList.rejected, (state, action) => {
        state.driversLoading = false;
        state.error = action.payload;
      })

      // Add Driver
      .addCase(addDriver.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addDriver.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Driver profile successfully created in registry!';
      })
      .addCase(addDriver.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearRegistryStatus } = registriesSlice.actions;
export default registriesSlice.reducer;
