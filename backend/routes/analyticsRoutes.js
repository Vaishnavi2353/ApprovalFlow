const express = require('express');
const { getSummary, getRecentActivity } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', protect, getSummary);
router.get('/activity', protect, getRecentActivity);

module.exports = router;
