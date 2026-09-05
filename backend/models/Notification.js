const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['submission', 'approval', 'rejection', 'pending_action', 'comment'],
      default: 'submission'
    },
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
