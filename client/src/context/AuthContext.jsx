import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set global base URL for axios requests
axios.defaults.baseURL = 'http://localhost:5000/api';

// Set default auth header if token exists (outside component to avoid render side-effects)
const token = localStorage.getItem('transit_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('transit_token');
      if (storedToken) {
        try {
          const response = await axios.get('/auth/me');
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
    const response = await axios.post('/auth/login', { email, password });
    const { token: receivedToken } = response.data;
    
    localStorage.setItem('transit_token', receivedToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    
    // Fetch full profile info (including driver sub-profile if applicable)
    const profileResponse = await axios.get('/auth/me');
    setUser(profileResponse.data.user);
    return profileResponse.data.user;
  };

  const register = async (registerData) => {
    const response = await axios.post('/auth/register', registerData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('transit_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
