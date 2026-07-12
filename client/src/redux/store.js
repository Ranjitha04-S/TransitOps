import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import maintenanceReducer from './maintenanceSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    maintenance: maintenanceReducer,
  },
});

export default store;
