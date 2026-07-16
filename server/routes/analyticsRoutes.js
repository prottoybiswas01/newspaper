const express = require('express');
const router = express.Router();
const { logEvent, getDashboardStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.post('/log', logEvent);
router.get('/dashboard', protect, authorize('Admin', 'Super Admin', 'Editor', 'SEO Manager'), getDashboardStats);

module.exports = router;
