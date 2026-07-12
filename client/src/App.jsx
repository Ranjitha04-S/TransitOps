import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import useAuth from './hooks/useAuth';

function DashboardHome() {
  const { user, logout } = useAuth();
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background selection:bg-primary selection:text-text-primary relative">
      {/* Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-lg p-8 md:p-12 rounded-3xl bg-surface border border-border backdrop-blur-xl shadow-2xl text-center flex flex-col items-center">
        
        {/* User Info Header */}
        <div className="w-full flex items-center justify-between border-b border-border/40 pb-4 mb-6 text-xs text-text-secondary">
          <div className="flex flex-col items-start">
            <span className="font-semibold text-text-primary">{user?.name}</span>
            <span className="text-[10px] text-primary uppercase font-bold tracking-wider">{user?.role}</span>
          </div>
          <button 
            onClick={logout}
            className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-alt text-text-primary font-semibold transition-all cursor-pointer active:scale-95"
          >
            Sign Out
          </button>
        </div>

        {/* Logo Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25 mb-6">
          <svg className="w-8 h-8 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1-1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight text-text-primary mb-2 uppercase">
          Transit<span className="text-primary">Ops</span>
        </h1>
        <p className="text-text-secondary text-sm font-medium mb-8 max-w-xs leading-relaxed">
          Smart Transport Operations Platform. Workstation successfully deployed.
        </p>

        {/* Dynamic State Previews */}
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-alt border border-border text-xs font-semibold text-text-primary">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            Available
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-alt border border-border text-xs font-semibold text-text-primary">
            <span className="w-2.5 h-2.5 rounded-full bg-info" />
            On Trip
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-alt border border-border text-xs font-semibold text-text-primary">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            In Shop
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-alt border border-border text-xs font-semibold text-text-primary">
            <span className="w-2.5 h-2.5 rounded-full bg-danger" />
            Retired
          </div>
        </div>

        {/* Interactive Button */}
        <button
          onClick={() => setCount(count + 1)}
          className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-text-primary font-bold transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-primary/20 cursor-pointer text-sm"
        >
          Initialize Dispatch ({count})
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        }
      />
      {/* Catch-all redirects to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
