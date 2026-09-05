const express = require('express');
const {
  submitDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  actOnDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.single('file'), submitDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);
router.get('/:id/download', protect, downloadDocument);
router.put('/:id/action', protect, actOnDocument);

module.exports = router;
