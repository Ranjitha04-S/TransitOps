import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" className="text-primary animate-spin" />
        <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase animate-pulse">
          Initializing TRNSPOT Command Center...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Unauthorized, redirect to dashboard or login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
