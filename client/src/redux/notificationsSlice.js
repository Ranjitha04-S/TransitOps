import { createSlice } from '@reduxjs/toolkit';

const initialMockNotifications = [
  {
    id: 1,
    title: 'Compliance Expiration Warning',
    message: "Driver David Ross's HGV license expired on 2026-06-01.",
    priority: 'High',
    category: 'compliance',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 2,
    title: 'Active Workshop repair log',
    message: 'Vehicle MH-12-TR-9982 Tata Winger is checked into maintenance for repair: Engine coolant flushes.',
    priority: 'Medium',
    category: 'maintenance',
    timestamp: '5 hours ago',
    read: false
  },
  {
    id: 3,
    title: 'Trip Dispatched successfully',
    message: 'Sarah Connor successfully dispatched on active cargo trip #TR-2 to Portland DC.',
    priority: 'Low',
    category: 'dispatch',
    timestamp: '1 day ago',
    read: false
  },
  {
    id: 4,
    title: 'Toll Expense Warning log',
    message: 'Fuel/Toll expense of ₹4,500 for vehicle MH-12-TR-9982 is higher than typical regional averages.',
    priority: 'Medium',
    category: 'financial',
    timestamp: '2 days ago',
    read: false
  }
];

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: initialMockNotifications,
    unreadCount: initialMockNotifications.filter(item => !item.read).length
  },
  reducers: {
    dismissNotification: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.unreadCount = state.items.filter(item => !item.read).length;
    },
    markAllAsRead: (state) => {
      state.items = state.items.map(item => ({ ...item, read: true }));
      state.unreadCount = 0;
    },
    clearAllNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    }
  }
});

export const { dismissNotification, markAllAsRead, clearAllNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
