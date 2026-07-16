const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscribers
} = require('../controllers/newsletterController');
const { protect, authorize } = require('../middleware/auth');

router.post('/subscribe', subscribe);
router.get('/unsubscribe', unsubscribe);

// CMS administration
router.get('/subscribers', protect, authorize('Admin', 'Super Admin', 'Editor'), getSubscribers);

module.exports = router;
