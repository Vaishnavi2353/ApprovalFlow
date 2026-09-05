const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. "submitted a document", "approved", "rejected"
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    meta: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
