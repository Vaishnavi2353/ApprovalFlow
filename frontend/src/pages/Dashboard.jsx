import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ActivityFeed from '../components/ActivityFeed';
import StatusBadge from '../components/StatusBadge';

const COLORS = { pending: '#f59e0b', in_review: '#3b82f6', approved: '#10b981', rejected: '#f43f5e' };

const StatCard = ({ icon: Icon, label, value, tint }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tint}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);

  useEffect(() => {
    api.get('/analytics/summary').then((res) => setSummary(res.data));
    api.get('/analytics/activity').then((res) => setActivity(res.data.slice(0, 6)));
    api.get('/documents').then((res) => setRecentDocs(res.data.slice(0, 5)));
  }, []);

  const pieData = summary
    ? Object.entries(summary.statusCounts)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: k, value: v }))
    : [];

  return (
    <Layout title={`Welcome, ${user?.name?.split(' ')[0] || ''}`}>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Here's what's happening with your documents today.</p>
        <button onClick={() => navigate('/documents?new=1')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Document
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Total Documents" value={summary?.totalDocuments ?? '—'} tint="bg-primary-50 text-primary-600 dark:bg-primary-900/30" />
        <StatCard icon={Clock} label="Pending / In Review" value={(summary?.statusCounts.pending ?? 0) + (summary?.statusCounts.in_review ?? 0)} tint="bg-amber-50 text-amber-600 dark:bg-amber-900/30" />
        <StatCard icon={CheckCircle2} label="Approved" value={summary?.statusCounts.approved ?? '—'} tint="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" />
        <StatCard icon={XCircle} label="Rejected" value={summary?.statusCounts.rejected ?? '—'} tint="bg-rose-50 text-rose-600 dark:bg-rose-900/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Status Breakdown</h3>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-16 text-center">No documents yet</p>
          )}
        </div>

        <div className="card p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Documents</h3>
          <div className="flex flex-col gap-3">
            {recentDocs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Nothing submitted yet</p>}
            {recentDocs.map((d) => (
              <div
                key={d._id}
                onClick={() => navigate(`/documents/${d._id}`)}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-2 -mx-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{d.title}</p>
                  <p className="text-xs text-gray-400">{d.submittedBy?.name}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Activity Feed</h3>
          <ActivityFeed items={activity} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
