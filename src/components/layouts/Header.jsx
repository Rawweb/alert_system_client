import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUnreadCount } from '../../hooks/useAlerts';

// onMenuClick: toggles the sidebar on mobile
const Header = ({ title, onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const { data: countData } = useUnreadCount();
  const unreadCount = countData?.unreadCount ?? 0;

  return (
    <header
      className='h-16 bg-surface border-b border-border
                       flex items-center justify-between px-4 md:px-6
                       sticky top-0 z-20'
    >
      <div className='flex items-center gap-3'>
        {/* Hamburger button: only visible on mobile (lg:hidden) */}
        <button
          onClick={onMenuClick}
          className='p-2 rounded-lg text-text-muted hover:bg-bg
                     transition-colors lg:hidden'
          aria-label='Open menu'
        >
          <Menu size={20} />
        </button>

        <h1 className='text-base md:text-lg font-semibold text-text-heading'>
          {title}
        </h1>
      </div>

      <div className='flex items-center gap-1 md:gap-2'>
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className='p-2 rounded-lg text-text-muted hover:bg-bg
                     hover:text-text-heading transition-colors'
          aria-label='Toggle theme'
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Alert bell */}
        <button
          onClick={() => navigate('/alerts')}
          className='relative p-2 rounded-lg text-text-muted
                     hover:bg-bg hover:text-text-heading transition-colors'
          aria-label='View alerts'
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className='absolute top-1 right-1 h-4 min-w-4
                             bg-red-500 text-white text-xs font-bold
                             rounded-full flex items-center justify-center
                             px-0.5 leading-none'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
