const express = require('express');
const router = express.Router();
const {
  serveAd,
  getAdsByPlacement,
  recordImpression,
  recordClick,
  getAdReports,
  getAllAds,
  createAd,
  updateAd,
  deleteAd
} = require('../controllers/adController');
const { protect, authorize } = require('../middleware/auth');

// Public Delivery & Tracking endpoints
router.get('/serve', serveAd);
router.get('/', getAdsByPlacement);
router.post('/:id/impression', recordImpression);
router.post('/:id/click', recordClick);

// Administrative / Ad Manager routes
router.get('/reports', protect, authorize('Admin', 'Super Admin', 'Ad Manager', 'Analyst'), getAdReports);
router.get('/all', protect, authorize('Admin', 'Super Admin', 'Ad Manager'), getAllAds);
router.post('/', protect, authorize('Admin', 'Super Admin', 'Ad Manager'), createAd);
router.put('/:id', protect, authorize('Admin', 'Super Admin', 'Ad Manager'), updateAd);
router.delete('/:id', protect, authorize('Admin', 'Super Admin', 'Ad Manager'), deleteAd);

module.exports = router;
