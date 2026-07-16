const express = require('express');
const router = express.Router();
const {
  getAdsByPlacement,
  recordImpression,
  recordClick,
  getAllAds,
  createAd,
  updateAd,
  deleteAd
} = require('../controllers/adController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAdsByPlacement);
router.post('/:id/impression', recordImpression);
router.post('/:id/click', recordClick);

// Administrative routes
router.get('/all', protect, authorize('Admin', 'Super Admin'), getAllAds);
router.post('/', protect, authorize('Admin', 'Super Admin'), createAd);
router.put('/:id', protect, authorize('Admin', 'Super Admin'), updateAd);
router.delete('/:id', protect, authorize('Admin', 'Super Admin'), deleteAd);

module.exports = router;
