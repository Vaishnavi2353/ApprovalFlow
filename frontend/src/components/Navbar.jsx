import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-gray-600" />}
        </button>

        <NotificationBell />

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
        </button>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
