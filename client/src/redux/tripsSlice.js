import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all trips with optional status filter
export const fetchTripsList = createAsyncThunk(
  'trips/fetchTripsList',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      const response = await axios.get(`/trips?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trips'
      );
    }
  }
);

// Fetch only Available vehicles for dispatching selection list
export const fetchAvailableVehicles = createAsyncThunk(
  'trips/fetchAvailableVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/vehicles?status=Available');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch available vehicles'
      );
    }
  }
);

// Fetch only Available drivers for dispatching selection list
export const fetchAvailableDrivers = createAsyncThunk(
  'trips/fetchAvailableDrivers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/drivers?status=Available');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch available drivers'
      );
    }
  }
);

// Create a trip draft
export const createTripDraft = createAsyncThunk(
  'trips/createTripDraft',
  async (tripData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/trips', tripData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create trip draft'
      );
    }
  }
);

// Dispatch a trip draft
export const dispatchTrip = createAsyncThunk(
  'trips/dispatchTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/trips/${tripId}/dispatch`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to dispatch trip'
      );
    }
  }
);

// Cancel a dispatched or draft trip
export const cancelTrip = createAsyncThunk(
  'trips/cancelTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/trips/${tripId}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel trip'
      );
    }
  }
);

// Complete a trip
export const completeTrip = createAsyncThunk(
  'trips/completeTrip',
  async ({ tripId, completionData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/trips/${tripId}/complete`, completionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to complete trip'
      );
    }
  }
);

const initialState = {
  trips: [],
  availableVehicles: [],
  availableDrivers: [],
  tripsLoading: false,
  availableLoading: false,
  submitting: false,
  error: null,
  successMessage: null,
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearTripStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trips
      .addCase(fetchTripsList.pending, (state) => {
        state.tripsLoading = true;
        state.error = null;
      })
      .addCase(fetchTripsList.fulfilled, (state, action) => {
        state.tripsLoading = false;
        state.trips = action.payload?.trips ?? [];
      })
      .addCase(fetchTripsList.rejected, (state, action) => {
        state.tripsLoading = false;
        state.error = action.payload;
      })

      // Fetch Available Vehicles
      .addCase(fetchAvailableVehicles.pending, (state) => {
        state.availableLoading = true;
      })
      .addCase(fetchAvailableVehicles.fulfilled, (state, action) => {
        state.availableLoading = false;
        state.availableVehicles = action.payload?.vehicles ?? [];
      })
      .addCase(fetchAvailableVehicles.rejected, (state) => {
        state.availableLoading = false;
      })

      // Fetch Available Drivers
      .addCase(fetchAvailableDrivers.pending, (state) => {
        state.availableLoading = true;
      })
      .addCase(fetchAvailableDrivers.fulfilled, (state, action) => {
        state.availableLoading = false;
        state.availableDrivers = action.payload?.drivers ?? [];
      })
      .addCase(fetchAvailableDrivers.rejected, (state) => {
        state.availableLoading = false;
      })

      // Create Draft
      .addCase(createTripDraft.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createTripDraft.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Trip draft created successfully!';
      })
      .addCase(createTripDraft.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Dispatch Trip
      .addCase(dispatchTrip.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(dispatchTrip.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Trip successfully dispatched!';
      })
      .addCase(dispatchTrip.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Cancel Trip
      .addCase(cancelTrip.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelTrip.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Trip successfully cancelled!';
      })
      .addCase(cancelTrip.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Complete Trip
      .addCase(completeTrip.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(completeTrip.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Trip completed and assets released successfully!';
      })
      .addCase(completeTrip.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearTripStatus } = tripsSlice.actions;
export default tripsSlice.reducer;
