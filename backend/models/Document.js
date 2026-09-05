const mongoose = require('mongoose');

// Each step of the multi-level approval chain
const approvalStepSchema = new mongoose.Schema(
  {
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: Number, required: true }, // 1, 2, 3 ...
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'skipped'],
      default: 'pending'
    },
    comment: { type: String, default: '' },
    actedAt: { type: Date }
  },
  { _id: false }
);

const historyEntrySchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // submitted, approved, rejected, commented, resubmitted
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, default: '' },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvalChain: [approvalStepSchema],
    currentLevel: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'approved', 'rejected'],
      default: 'pending'
    },
    history: [historyEntrySchema],
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' }
  },
  { timestamps: true }
);

documentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Document', documentSchema);
