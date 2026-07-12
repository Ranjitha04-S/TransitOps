import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePreferences, updateProfile } from '../redux/settingsSlice';
import MainLayout from '../components/layout/MainLayout';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import useAuth from '../hooks/useAuth';
import { 
  User, 
  Globe, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const settingsState = useSelector((state) => state.settings);

  // Profile Form States
  const [profileName, setProfileName] = useState(settingsState.profileName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference Form States
  const [distanceUnit, setDistanceUnit] = useState(settingsState.distanceUnit);
  const [capacityUnit, setCapacityUnit] = useState(settingsState.capacityUnit);
  const [currency, setCurrency] = useState(settingsState.currency);
  const [refreshInterval, setRefreshInterval] = useState(settingsState.refreshInterval);

  // Status Notices
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [prefSuccess, setPrefSuccess] = useState('');

  // Profile Submit handler
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!profileName.trim()) {
      setProfileError('Username cannot be empty');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setProfileError('Security passcode must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setProfileError('Passcodes do not match');
        return;
      }
    }

    dispatch(updateProfile({ profileName }));
    setProfileSuccess('Profile settings updated successfully!');
    setPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  // Preference Submit handler
  const handlePrefSubmit = (e) => {
    e.preventDefault();
    setPrefSuccess('');

    dispatch(updatePreferences({
      distanceUnit,
      capacityUnit,
      currency,
      refreshInterval
    }));

    setPrefSuccess('Operational preferences saved successfully!');
    setTimeout(() => setPrefSuccess(''), 3000);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 max-w-full animate-fadeIn">
        {/* Page Header */}
        <div>
          <h2 className="text-xl font-extrabold text-text-primary uppercase tracking-wide">
            Console Settings
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure default unit systems, console refresh frequency, and credentials.
          </p>
        </div>

        {/* Configuration Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* User Profile Configurations */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <User size={18} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Operator Profile Settings
              </h3>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-success/15 border border-success/35 text-xs text-success font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle size={15} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-danger/15 border border-danger/35 text-xs text-danger font-semibold flex items-center gap-2 animate-fadeIn">
                <AlertTriangle size={15} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-surface-alt/55 border border-border p-3.5 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    Assigned Security Role
                  </span>
                  <span className="text-xs font-extrabold text-text-primary mt-0.5">
                    {user?.role ?? 'Console Guest'}
                  </span>
                </div>
                <Badge variant="primary">{user?.role === 'Fleet Manager' ? 'Admin Access' : 'Limited Access'}</Badge>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Workstation Email
                </span>
                <span className="text-xs font-semibold text-text-secondary mt-1 ml-1 select-none">
                  {user?.email ?? 'guest@transitops.com'}
                </span>
              </div>

              <Input
                label="Operator Username"
                type="text"
                placeholder="e.g. RANJITHA S"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="New Authorization Key"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                <Input
                  label="Confirm Key"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end mt-2">
                <Button type="submit" variant="primary" className="py-2 px-6">
                  Save Profile Settings
                </Button>
              </div>
            </form>
          </div>

          {/* Operational Preferences configurations */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Globe size={18} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Operational Preferences
              </h3>
            </div>

            {prefSuccess && (
              <div className="p-3.5 rounded-xl bg-success/15 border border-success/35 text-xs text-success font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle size={15} />
                <span>{prefSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePrefSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Distance Units system"
                  options={[
                    { value: 'metric', label: 'Metric (Kilometers)' },
                    { value: 'imperial', label: 'Imperial (Miles)' }
                  ]}
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  required
                />

                <Select
                  label="Cargo Load Capacity system"
                  options={[
                    { value: 'metric', label: 'Metric (Kilograms)' },
                    { value: 'imperial', label: 'Imperial (Pounds)' }
                  ]}
                  value={capacityUnit}
                  onChange={(e) => setCapacityUnit(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Preferred Currency system"
                  options={[
                    { value: 'INR', label: 'INR (₹) Indian Rupee' },
                    { value: 'USD', label: 'USD ($) US Dollar' }
                  ]}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                />

                <Select
                  label="Live Telemetry Reload interval"
                  options={[
                    { value: '10', label: 'Real-time (10s refresh)' },
                    { value: '30', label: 'Standard (30s refresh)' },
                    { value: '60', label: 'Standard (60s refresh)' },
                    { value: 'manual', label: 'Manual Only' }
                  ]}
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end mt-2">
                <Button type="submit" variant="primary" className="py-2 px-6">
                  Save Preferences
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
