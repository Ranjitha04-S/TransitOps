import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, CreditCard, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Checkbox from '../components/common/Checkbox';
import Button from '../components/common/Button';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleQuickAutofill = async (email, roleLabel) => {
    setApiError('');
    setErrors({});
    const defaultPassword = 'password123';
    
    setLoginFields((prev) => ({
      ...prev,
      email: email,
      password: defaultPassword
    }));

    setLoading(true);
    try {
      await login(email, defaultPassword);
      navigate('/');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || `Autofill authentication failed for ${roleLabel}.`;
      setApiError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Mode state: 'login' | 'register'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  
  // Field validation errors
  const [errors, setErrors] = useState({});

  // Form fields
  const [loginFields, setLoginFields] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [registerFields, setRegisterFields] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Driver', // 'Driver' | 'Fleet Manager'
    licenseNumber: '',
    licenseExpirationDate: ''
  });

  // Role options matching backend requirements
  const roleOptions = [
    { value: 'Driver', label: 'Transit Driver' },
    { value: 'Fleet Manager', label: 'Fleet Manager' }
  ];

  // Handlers
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginFields((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterFields((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setApiError('');
    setApiSuccess('');
  };

  // Validations
  const validateLoginForm = () => {
    const newErrors = {};
    if (!loginFields.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(loginFields.email)) {
      newErrors.email = 'Invalid email address format';
    }
    
    if (!loginFields.password) {
      newErrors.password = 'Security password is required';
    } else if (loginFields.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    
    if (!registerFields.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!registerFields.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(registerFields.email)) {
      newErrors.email = 'Invalid email address format';
    }
    
    if (!registerFields.password) {
      newErrors.password = 'Password is required';
    } else if (registerFields.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (registerFields.password !== registerFields.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (registerFields.role === 'Driver') {
      if (!registerFields.licenseNumber.trim()) {
        newErrors.licenseNumber = 'Driver license number is required';
      }
      if (!registerFields.licenseExpirationDate) {
        newErrors.licenseExpirationDate = 'License expiration date is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      await login(loginFields.email, loginFields.password);
      // Success redirects to dashboard
      navigate('/');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
      setApiError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    
    if (!validateRegisterForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: registerFields.name,
        email: registerFields.email,
        password: registerFields.password,
        role: registerFields.role
      };

      // Add driver details if selected
      if (registerFields.role === 'Driver') {
        payload.licenseNumber = registerFields.licenseNumber;
        payload.licenseExpirationDate = registerFields.licenseExpirationDate;
      }

      await register(payload);
      
      setApiSuccess('Registration successful! You can now sign in.');
      setMode('login');
      // Autofill email
      setLoginFields((prev) => ({ ...prev, email: registerFields.email }));
      // Clear register fields
      setRegisterFields({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Driver',
        licenseNumber: '',
        licenseExpirationDate: ''
      });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Registration failed. Please check details and try again.';
      setApiError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="glass-panel p-5 md:p-6 rounded-2xl shadow-2xl relative border border-border">
        {/* Branding header inside the card */}
        <div className="flex items-center gap-3 justify-center mb-3 pb-3 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1-1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-extrabold tracking-wider text-text-primary uppercase leading-tight">
              TRANSPORTOPS
            </h1>
            <span className="text-[10px] tracking-widest text-text-muted font-bold uppercase -mt-1 block">
              Ops Control
            </span>
          </div>
        </div>

        {/* Banner header inside card */}
        <div className="mb-3 text-center">
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            {mode === 'login' ? 'Login' : 'Deploy Account'}
          </h2>
        </div>

        {/* Global Notices */}
        {apiError && (
          <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 flex gap-2.5 items-start text-xs text-danger">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-normal font-medium">{apiError}</p>
          </div>
        )}

        {apiSuccess && (
          <div className="mb-5 p-3.5 rounded-xl bg-success/10 border border-success/20 flex gap-2.5 items-start text-xs text-success">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <p className="leading-normal font-medium">{apiSuccess}</p>
          </div>
        )}

        {mode === 'login' ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <Input
              label="Workstation Email"
              type="email"
              name="email"
              placeholder="e.g. dispatcher@trnspot.com"
              value={loginFields.email}
              onChange={handleLoginChange}
              error={errors.email}
              icon={Mail}
              required
            />
            
            <Input
              label="Authorization Key"
              type="password"
              name="password"
              placeholder="••••••••"
              value={loginFields.password}
              onChange={handleLoginChange}
              error={errors.password}
              icon={Lock}
              required
            />

            <div className="flex items-center justify-between mt-1 mb-2">
              <Checkbox
                label="Remember workstation"
                name="remember"
                checked={loginFields.remember}
                onChange={handleLoginChange}
              />
              
              <button 
                type="button"
                className="text-[11px] font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                onClick={() => setApiError('Password recovery is handled via safety administrators.')}
              >
                Forgot Authorization?
              </button>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Sign In 
            </Button>

            <div className="mt-3.5 pt-3 border-t border-border flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted select-none">
                Quick Demo Access (Autofill)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAutofill('manager@transitops.com', 'Fleet Manager')}
                  disabled={loading}
                  className="py-2 px-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Log in as Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAutofill('driver@transitops.com', 'Driver')}
                  disabled={loading}
                  className="py-2 px-2.5 bg-info/10 hover:bg-info/20 text-info border border-info/20 text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Log in as Driver
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAutofill('safety@transitops.com', 'Safety Officer')}
                  disabled={loading}
                  className="py-2 px-2.5 bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20 text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Log in as Safety
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAutofill('finance@transitops.com', 'Financial Analyst')}
                  disabled={loading}
                  className="py-2 px-2.5 bg-success/10 hover:bg-success/20 text-success border border-success/20 text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Log in as Finance
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <Input
              label="Dispatcher Full Name"
              type="text"
              name="name"
              placeholder="e.g. Ranjitha S"
              value={registerFields.name}
              onChange={handleRegisterChange}
              error={errors.name}
              icon={User}
              required
            />

            <Input
              label="Workstation Email"
              type="email"
              name="email"
              placeholder="e.g. name@trnspot.com"
              value={registerFields.email}
              onChange={handleRegisterChange}
              error={errors.email}
              icon={Mail}
              required
            />

            <Select
              label="Operational Command Role"
              name="role"
              options={roleOptions}
              value={registerFields.role}
              onChange={handleRegisterChange}
              error={errors.role}
              required
            />

            {registerFields.role === 'Driver' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-alt border border-border/60 animate-fadeIn">
                <Input
                  label="License Number"
                  type="text"
                  name="licenseNumber"
                  placeholder="e.g. DL-1002341"
                  value={registerFields.licenseNumber}
                  onChange={handleRegisterChange}
                  error={errors.licenseNumber}
                  icon={CreditCard}
                  required
                />
                
                <Input
                  label="Expiration Date"
                  type="date"
                  name="licenseExpirationDate"
                  value={registerFields.licenseExpirationDate}
                  onChange={handleRegisterChange}
                  error={errors.licenseExpirationDate}
                  icon={Calendar}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Authorization Key"
                type="password"
                name="password"
                placeholder="••••••••"
                value={registerFields.password}
                onChange={handleRegisterChange}
                error={errors.password}
                icon={Lock}
                required
              />

              <Input
                label="Confirm Key"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={registerFields.confirmPassword}
                onChange={handleRegisterChange}
                error={errors.confirmPassword}
                icon={Lock}
                required
              />
            </div>

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Configure Workstation
            </Button>
          </form>
        )}

        {/* Form Mode Toggle Footer */}
        <div className="text-center mt-6 pt-5 border-t border-border/40">
          <p className="text-xs text-text-muted">
            {mode === 'login' ? 'Require a new access card?' : 'Already have active clearance?'}
            <button
              onClick={toggleMode}
              className="text-primary font-bold ml-1.5 hover:text-primary-hover transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              {mode === 'login' ? 'Configure Workstation' : 'Deploy Workstation'}
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
