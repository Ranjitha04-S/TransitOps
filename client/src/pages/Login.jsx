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
      <div className="glass-panel p-8 md:p-10 rounded-2xl shadow-2xl relative border border-border">
        {/* Banner header inside card */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
            {mode === 'login' ? 'System Login' : 'Deploy Account'}
          </h2>
          <p className="text-text-muted text-xs mt-1">
            {mode === 'login' 
              ? 'Provide authorization credentials to access console.' 
              : 'Configure operational profiles to deploy workstation.'}
          </p>
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
              Sign In to Deploy
            </Button>
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
