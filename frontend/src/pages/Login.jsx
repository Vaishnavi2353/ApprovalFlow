import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-gray-600" />}
      </button>

      <div className="w-full max-w-sm card p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">ApprovalFlow</span>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-6">Sign in to continue to your workspace</p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" required className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              className="input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-6 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
          Demo accounts (after running <code>node seed.js</code> in backend):
          <br />admin@approvalflow.com / password123
          <br />approver1@approvalflow.com / password123
          <br />employee@approvalflow.com / password123
        </div>
      </div>
    </div>
  );
};

export default Login;
