const Notification = require('../models/Notification');

// @route GET /api/notifications
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(50);
  res.json(notifications);
};

// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  res.json(notif);
};

// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
