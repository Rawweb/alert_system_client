import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Bell,
  BarChart3,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUnreadCount } from '../../hooks/useAlerts';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

// onClose: called when the X button is tapped on mobile
const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: countData } = useUnreadCount();
  const unreadCount = countData?.unreadCount ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className='w-64 h-screen flex flex-col bg-surface
                      border-r border-border'
    >
      {/* Brand + mobile close button */}
      <div
        className='px-4 py-5 border-b border-border
                      flex items-center justify-between'
      >
        <div className='flex items-center gap-3'>
          <div
            className='w-9 h-9 rounded-xl bg-primary flex items-center
                          justify-center flex-shrink-0'
          >
            <ShieldCheck size={18} className='text-white' />
          </div>
          <div className='min-w-0'>
            <p
              className='text-sm font-bold text-text-heading truncate
                          leading-tight'
            >
              Expiry Alert
            </p>
            <p className='text-xs text-text-muted truncate'>
              Management System
            </p>
          </div>
        </div>

        {/* Close button: only visible on mobile */}
        <button
          onClick={onClose}
          className='p-1.5 rounded-lg text-text-muted hover:bg-bg
                     transition-colors lg:hidden'
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto'>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose} // close sidebar on mobile after navigation
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
               font-medium transition-colors duration-150
               ${
                 isActive
                   ? 'bg-primary text-white'
                   : 'text-text hover:bg-bg hover:text-text-heading'
               }`
            }
          >
            <Icon size={18} className='flex-shrink-0' />
            <span className='flex-1'>{label}</span>

            {label === 'Alerts' && unreadCount > 0 && (
              <span
                className='bg-red-500 text-white text-xs font-bold
                               rounded-full h-5 min-w-5 flex items-center
                               justify-center px-1'
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className='px-3 py-4 border-t border-border space-y-1'>
        <div className='px-3 py-2'>
          <p className='text-sm font-medium text-text-heading truncate'>
            {user?.name}
          </p>
          <p className='text-xs text-text-muted truncate'>{user?.email}</p>
          <span
            className='inline-block mt-1 text-xs bg-primary/10
                           text-primary px-2 py-0.5 rounded-full
                           font-medium capitalize'
          >
            {user?.role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                     text-sm font-medium text-text hover:bg-red-50
                     hover:text-red-600 dark:hover:bg-red-900/20
                     dark:hover:text-red-400 transition-colors'
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
