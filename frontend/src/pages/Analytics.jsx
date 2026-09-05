import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';
import Layout from '../components/Layout';

const COLORS = { pending: '#f59e0b', in_review: '#3b82f6', approved: '#10b981', rejected: '#f43f5e' };
const BAR_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5', '#3730a3', '#c7d2fe'];

const Analytics = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/analytics/summary').then((res) => setSummary(res.data));
  }, []);

  if (!summary) {
    return (
      <Layout title="Analytics">
        <p className="text-sm text-gray-400">Loading analytics...</p>
      </Layout>
    );
  }

  const pieData = Object.entries(summary.statusCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v }));

  return (
    <Layout title="Approval Analytics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Documents by Status</h3>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-20 text-center">No data yet</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Documents by Category</h3>
          {summary.categoryCounts.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={summary.categoryCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415555" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {summary.categoryCounts.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-20 text-center">No data yet</p>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">6-Month Trend</h3>
          {summary.monthlyTrend.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={summary.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415555" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} name="Submitted" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#f43f5e" strokeWidth={2} name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-20 text-center">No data yet</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
