import { createSlice } from '@reduxjs/toolkit';

const SETTINGS_KEY = 'transitops_console_settings';

const defaultSettings = {
  distanceUnit: 'metric', // 'metric' | 'imperial'
  capacityUnit: 'metric', // 'metric' | 'imperial'
  currency: 'INR', // 'INR' | 'USD'
  refreshInterval: '30', // '10' | '30' | '60' | 'manual'
  profileName: 'Neural Operator',
};

// Load preferences from localStorage if exists
const loadInitialState = () => {
  try {
    const cached = localStorage.getItem(SETTINGS_KEY);
    if (cached) {
      return {
        ...defaultSettings,
        ...JSON.parse(cached),
      };
    }
  } catch (e) {
    console.error('Failed to load settings from cache:', e);
  }
  return defaultSettings;
};

const initialState = loadInitialState();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updatePreferences: (state, action) => {
      const { distanceUnit, capacityUnit, currency, refreshInterval } = action.payload;
      if (distanceUnit) state.distanceUnit = distanceUnit;
      if (capacityUnit) state.capacityUnit = capacityUnit;
      if (currency) state.currency = currency;
      if (refreshInterval) state.refreshInterval = refreshInterval;

      // Persist configuration change
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save settings:', e);
      }
    },
    updateProfile: (state, action) => {
      const { profileName } = action.payload;
      if (profileName) state.profileName = profileName;

      // Persist configuration change
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save settings:', e);
      }
    }
  }
});

export const { updatePreferences, updateProfile } = settingsSlice.actions;
export default settingsSlice.reducer;
