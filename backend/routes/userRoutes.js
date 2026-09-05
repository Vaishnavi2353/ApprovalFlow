const express = require('express');
const { listUsers, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, listUsers);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
