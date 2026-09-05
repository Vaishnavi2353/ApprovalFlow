const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');

// @route GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const isPrivileged = ['admin', 'approver'].includes(req.user.role);
    const baseFilter = isPrivileged ? {} : { submittedBy: req.user._id };

    const statusCounts = await Document.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = { pending: 0, in_review: 0, approved: 0, rejected: 0 };
    statusCounts.forEach((s) => (statusMap[s._id] = s.count));

    const categoryCounts = await Document.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Last 6 months trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrend = await Document.aggregate([
      { $match: { ...baseFilter, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const totalDocs = await Document.countDocuments(baseFilter);

    res.json({
      totalDocuments: totalDocs,
      statusCounts: statusMap,
      categoryCounts: categoryCounts.map((c) => ({ category: c._id, count: c.count })),
      monthlyTrend: monthlyTrend.map((m) => ({
        label: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        total: m.count,
        approved: m.approved,
        rejected: m.rejected
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/analytics/activity
const getRecentActivity = async (req, res) => {
  const isPrivileged = ['admin', 'approver'].includes(req.user.role);
  const filter = isPrivileged ? {} : { user: req.user._id };
  const activity = await ActivityLog.find(filter)
    .populate('user', 'name avatar')
    .populate('document', 'title')
    .sort('-createdAt')
    .limit(30);
  res.json(activity);
};

module.exports = { getSummary, getRecentActivity };
