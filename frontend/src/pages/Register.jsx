import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm card p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">ApprovalFlow</span>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Create an account</h2>
        <p className="text-sm text-gray-500 mb-6">Get started with document approvals</p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
            <input required className="input mt-1" value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" required className="input mt-1" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input mt-1"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select className="input mt-1" value={form.role} onChange={(e) => update('role', e.target.value)}>
                <option value="employee">Employee</option>
                <option value="approver">Approver</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <input className="input mt-1" value={form.department} onChange={(e) => update('department', e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
