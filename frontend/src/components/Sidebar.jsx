import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, User, Files } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItem =
  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ' +
  'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';
const activeItem = 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-screen px-3 py-6">
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">ApprovalFlow</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink to="/" end className={({ isActive }) => `${navItem} ${isActive ? activeItem : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/documents" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ''}`}>
          <FileText size={18} /> Documents
        </NavLink>
        {(user?.role === 'approver' || user?.role === 'admin') && (
          <NavLink to="/documents?pendingMyApproval=true" className={navItem}>
            <Files size={18} /> Pending My Approval
          </NavLink>
        )}
        <NavLink to="/analytics" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ''}`}>
          <BarChart3 size={18} /> Analytics
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ''}`}>
          <User size={18} /> Profile
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
