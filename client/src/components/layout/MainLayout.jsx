import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Wrench, 
  Navigation,
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  User,
  Bell
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Registries', path: '/fleet', icon: Truck },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Trips', path: '/trips', icon: Navigation },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-text-primary">
      {/* Top Navbar */}
      <header className="bg-surface border-b border-border sticky top-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-surface-alt text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/45"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-text-primary shadow-md shadow-primary/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <h1 className="text-md font-extrabold tracking-wider text-text-primary uppercase leading-none">
                TRANSPORTOPS
              </h1>
              <span className="text-[8px] tracking-widest text-text-muted font-bold uppercase leading-none block">
                Ops Control
              </span>
            </div>
          </div>
        </div>

        {/* Topbar Right Section */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-alt text-text-secondary relative transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <div className="w-8 h-8 rounded-full bg-surface-alt border border-border flex items-center justify-center text-text-secondary">
              <User size={16} />
            </div>
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-xs font-semibold text-text-primary">{user?.name}</span>
              <span className="text-[9px] text-text-muted font-semibold mt-0.5">{user?.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-danger/10 hover:text-danger text-text-secondary transition-colors cursor-pointer hidden md:flex items-center gap-2 text-xs font-semibold"
            title="Sign Out"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex relative">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex w-64 bg-surface border-r border-border flex-col justify-between p-6">
          <div className="flex flex-col gap-8">
            <div className="text-xs font-bold tracking-wider uppercase text-text-muted">
              Fleet Navigation
            </div>
            <nav className="flex flex-col gap-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer w-full text-left
                      ${isActive 
                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                      }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Info Card */}
          <div className="p-4 rounded-xl bg-surface-alt border border-border flex flex-col gap-2">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-text-secondary">
              Workstation Status
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-semibold text-text-primary">Connected to Node-5</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-secondary/30 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative flex flex-col w-64 bg-surface border-r border-border p-6 justify-between animate-slideRight">
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider uppercase text-text-muted">
                    Navigation
                  </span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-md text-text-secondary hover:bg-surface-alt"
                  >
                    <X size={16} />
                  </button>
                </div>
                <nav className="flex flex-col gap-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer w-full text-left
                          ${isActive 
                            ? 'bg-primary text-white shadow-md shadow-primary/20' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                          }`}
                      >
                        <Icon size={16} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Logout Option */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-xs font-bold tracking-wide uppercase text-danger hover:bg-danger/10 transition-all cursor-pointer w-full text-left"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Content View Container */}
        <main className="flex-1 bg-background p-4 md:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
