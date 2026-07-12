# Frontend Integration Guide: Phase 1 (Authentication & RBAC)

This guide provides a blueprint for integrating the authentication and Role-Based Access Control (RBAC) APIs in the React frontend.

---

## 🔑 Authentication Endpoints

*   **Host URL**: `http://localhost:5000` (Make sure your Axios / Fetch base URL is set to `http://localhost:5000/api`)
*   **Endpoints**:
    *   `POST /auth/register` (Register manager or driver account)
    *   `POST /auth/login` (Submit credentials to acquire JWT token)
    *   `GET /auth/me` (Fetch current user and role profile on app load)

---

## ⚡ React AuthContext Implementation Blueprint

Create an authentication context (`src/context/AuthContext.jsx`) to wrap your application:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default auth header if token exists
  const token = localStorage.getItem('transit_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('transit_token');
      if (storedToken) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error("Session restore failed:", error);
          localStorage.removeItem('transit_token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    const { token, user: loggedUser } = response.data;
    
    localStorage.setItem('transit_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch full profile info (including driver sub-profile if applicable)
    const profileResponse = await axios.get('http://localhost:5000/api/auth/me');
    setUser(profileResponse.data.user);
    return profileResponse.data.user;
  };

  const logout = () => {
    localStorage.removeItem('transit_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 🛡️ Routing & Protection Rules

Implement route wrappers to redirect users based on login state and privileges:

### Protected Route Wrapper
```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading transit operations...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Unauthorized, redirect to home/dashboard
  }

  return children;
};
```

### Usage Example in `App.jsx`
```javascript
<Routes>
  <Route path="/login" element={<Login />} />
  
  <Route path="/" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  
  <Route path="/dispatch" element={
    <ProtectedRoute allowedRoles={['Fleet Manager', 'Driver']}>
      <TripDispatcher />
    </ProtectedRoute>
  } />
  
  <Route path="/settings" element={
    <ProtectedRoute allowedRoles={['Fleet Manager']}>
      <Settings />
    </ProtectedRoute>
  } />
</Routes>
```

---

## 🎨 Recommended UI Elements (Login Screen)

*   **Layout**: Split screen. Left pane has a dark background panel showing the **TransitOps** branding + an overview of the roles (Manager, Driver, Safety, Financial). Right pane has the login form.
*   **State management**: Display a select dropdown or helpful notes informing users that registration hooks are separated. Provide options to register as a driver (requires driver license numbers/dates) or a manager.
*   **Colors**: Form inputs should use the glassmorphic dark theme colors (`bg-bg-card-glass` and `border-border-glass`) with text in `text-text-light` and active border transitions to `primary-orange`.
