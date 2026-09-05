const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const docsDir = path.join(__dirname, '..', 'uploads', 'documents');
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
[docsDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') return cb(null, avatarsDir);
    cb(null, docsDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'avatar') {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Avatar must be an image file'));
  }
  // Documents: allow pdf, doc, docx, images
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Unsupported file type. Allowed: PDF, DOC, DOCX, PNG, JPG'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

module.exports = upload;
