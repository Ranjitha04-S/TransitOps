import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import Registries from './pages/Registries';
import Trips from './pages/Trips';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Fleet Manager: full CRUD | Safety Officer & Financial Analyst & Driver: read-only */}
      <Route
        path="/fleet"
        element={
          <ProtectedRoute allowedRoles={['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst']}>
            <Registries />
          </ProtectedRoute>
        }
      />
      {/* Fleet Manager: full CRUD | Safety Officer & Financial Analyst: view-only */}
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute allowedRoles={['Fleet Manager', 'Safety Officer', 'Financial Analyst']}>
            <Maintenance />
          </ProtectedRoute>
        }
      />
      {/* Fleet Manager & Driver: full actions | Safety Officer & Financial Analyst: view-only */}
      <Route
        path="/trips"
        element={
          <ProtectedRoute allowedRoles={['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst']}>
            <Trips />
          </ProtectedRoute>
        }
      />
      {/* Fleet Manager & Financial Analyst: full access */}
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={['Fleet Manager', 'Financial Analyst']}>
            <Expenses />
          </ProtectedRoute>
        }
      />
      {/* Fleet Manager, Financial Analyst, Safety Officer: view reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['Fleet Manager', 'Financial Analyst', 'Safety Officer']}>
            <Reports />
          </ProtectedRoute>
        }
      />
      {/* Catch-all redirects to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
