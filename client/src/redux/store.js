import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import maintenanceReducer from './maintenanceSlice';
import registriesReducer from './registriesSlice';
import tripsReducer from './tripsSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    maintenance: maintenanceReducer,
    registries: registriesReducer,
    trips: tripsReducer,
  },
});

export default store;
