const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { emitToUser } = require('../utils/socket');

const notifyAndEmail = async ({ userId, message, type, documentId, emailSubject, emailHtml }) => {
  const notif = await Notification.create({ user: userId, message, type, document: documentId });
  emitToUser(userId, 'notification', notif);

  if (emailSubject) {
    const user = await User.findById(userId);
    if (user?.email) {
      sendEmail({ to: user.email, subject: emailSubject, html: emailHtml || `<p>${message}</p>` });
    }
  }
};

// @route POST /api/documents
const submitDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'A document file is required' });

    const { title, description, category, priority } = req.body;
    let approverIds = req.body.approvers;
    if (typeof approverIds === 'string') {
      try {
        approverIds = JSON.parse(approverIds);
      } catch {
        approverIds = [approverIds];
      }
    }
    if (!Array.isArray(approverIds) || approverIds.length === 0) {
      return res.status(400).json({ message: 'At least one approver is required' });
    }

    const approvalChain = approverIds.map((approverId, idx) => ({
      approver: approverId,
      level: idx + 1,
      status: 'pending'
    }));

    const doc = await Document.create({
      title,
      description,
      category,
      priority,
      fileName: req.file.originalname,
      filePath: `/uploads/documents/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      submittedBy: req.user._id,
      approvalChain,
      currentLevel: 1,
      status: 'in_review',
      history: [{ action: 'submitted', by: req.user._id, note: 'Document submitted for approval' }]
    });

    await ActivityLog.create({
      user: req.user._id,
      action: `submitted "${doc.title}"`,
      document: doc._id
    });

    // Notify first-level approver
    const firstApprover = approvalChain[0].approver;
    await notifyAndEmail({
      userId: firstApprover,
      message: `${req.user.name} submitted "${doc.title}" for your approval`,
      type: 'pending_action',
      documentId: doc._id,
      emailSubject: `Action required: "${doc.title}" awaits your approval`,
      emailHtml: `<p><b>${req.user.name}</b> submitted <b>${doc.title}</b> and it is awaiting your review on ApprovalFlow.</p>`
    });

    const populated = await Document.findById(doc._id)
      .populate('submittedBy', 'name email avatar')
      .populate('approvalChain.approver', 'name email avatar role');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/documents  (list + search + filters)
const getDocuments = async (req, res) => {
  try {
    const { search, status, category, priority, mine, pendingMyApproval } = req.query;
    const filter = {};

    if (mine === 'true') filter.submittedBy = req.user._id;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) filter.$text = { $search: search };

    if (pendingMyApproval === 'true') {
      filter['approvalChain'] = {
        $elemMatch: { approver: req.user._id, status: 'pending' }
      };
    }

    // Employees only ever see their own submissions unless explicitly asking
    // about documents pending their own approval action.
    if (req.user.role === 'employee' && pendingMyApproval !== 'true') {
      filter.submittedBy = req.user._id;
    }

    const docs = await Document.find(filter)
      .populate('submittedBy', 'name email avatar department')
      .populate('approvalChain.approver', 'name email avatar role')
      .sort('-createdAt');

    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/documents/:id
const getDocumentById = async (req, res) => {
  const doc = await Document.findById(req.params.id)
    .populate('submittedBy', 'name email avatar department')
    .populate('approvalChain.approver', 'name email avatar role')
    .populate('history.by', 'name avatar');
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  res.json(doc);
};

// @route GET /api/documents/:id/download
const downloadDocument = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  const absPath = path.join(__dirname, '..', doc.filePath);
  if (!fs.existsSync(absPath)) return res.status(404).json({ message: 'File missing on server' });
  res.download(absPath, doc.fileName);
};

// @route PUT /api/documents/:id/action   body: { decision: 'approved'|'rejected', comment }
const actOnDocument = async (req, res) => {
  try {
    const { decision, comment } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'decision must be approved or rejected' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    if (doc.status !== 'in_review' && doc.status !== 'pending') {
      return res.status(400).json({ message: `Document already ${doc.status}` });
    }

    const step = doc.approvalChain.find(
      (s) => s.level === doc.currentLevel && s.approver.toString() === req.user._id.toString()
    );
    if (!step) {
      return res.status(403).json({ message: 'You are not the current approver for this document' });
    }
    if (step.status !== 'pending') {
      return res.status(400).json({ message: 'You have already acted on this document' });
    }

    step.status = decision;
    step.comment = comment || '';
    step.actedAt = new Date();

    doc.history.push({
      action: decision,
      by: req.user._id,
      note: comment || ''
    });

    const submitter = await User.findById(doc.submittedBy);

    if (decision === 'rejected') {
      doc.status = 'rejected';
      await doc.save();

      await ActivityLog.create({ user: req.user._id, action: `rejected "${doc.title}"`, document: doc._id });

      await notifyAndEmail({
        userId: doc.submittedBy,
        message: `${req.user.name} rejected "${doc.title}"${comment ? `: ${comment}` : ''}`,
        type: 'rejection',
        documentId: doc._id,
        emailSubject: `Your document "${doc.title}" was rejected`,
        emailHtml: `<p><b>${req.user.name}</b> rejected <b>${doc.title}</b>.</p>${comment ? `<p>Comment: ${comment}</p>` : ''}`
      });
    } else {
      const isLastLevel = doc.currentLevel === doc.approvalChain.length;
      await ActivityLog.create({ user: req.user._id, action: `approved "${doc.title}"`, document: doc._id });

      if (isLastLevel) {
        doc.status = 'approved';
        await doc.save();

        await notifyAndEmail({
          userId: doc.submittedBy,
          message: `"${doc.title}" has been fully approved`,
          type: 'approval',
          documentId: doc._id,
          emailSubject: `Your document "${doc.title}" was approved`,
          emailHtml: `<p>Good news! <b>${doc.title}</b> has completed all approval levels and is now <b>approved</b>.</p>`
        });
      } else {
        doc.currentLevel += 1;
        doc.status = 'in_review';
        await doc.save();

        const nextStep = doc.approvalChain.find((s) => s.level === doc.currentLevel);
        await notifyAndEmail({
          userId: nextStep.approver,
          message: `"${doc.title}" needs your approval (level ${doc.currentLevel})`,
          type: 'pending_action',
          documentId: doc._id,
          emailSubject: `Action required: "${doc.title}" awaits your approval`,
          emailHtml: `<p><b>${doc.title}</b> passed level ${doc.currentLevel - 1} and now needs your review.</p>`
        });

        // Let the submitter know their doc moved forward too
        emitToUser(doc.submittedBy, 'notification', {
          message: `"${doc.title}" advanced to level ${doc.currentLevel} approval`,
          type: 'approval',
          document: doc._id,
          createdAt: new Date()
        });
      }
    }

    const populated = await Document.findById(doc._id)
      .populate('submittedBy', 'name email avatar')
      .populate('approvalChain.approver', 'name email avatar role')
      .populate('history.by', 'name avatar');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  submitDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  actOnDocument
};
