import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import maintenanceReducer from './maintenanceSlice';
import registriesReducer from './registriesSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    maintenance: maintenanceReducer,
    registries: registriesReducer,
  },
});

export default store;
