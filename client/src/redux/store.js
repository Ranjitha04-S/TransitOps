import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import maintenanceReducer from './maintenanceSlice';
import registriesReducer from './registriesSlice';
import tripsReducer from './tripsSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    maintenance: maintenanceReducer,
    registries: registriesReducer,
    trips: tripsReducer,
    settings: settingsReducer,
  },
});

export default store;
