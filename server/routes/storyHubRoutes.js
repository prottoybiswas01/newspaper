const express = require('express');
const router = express.Router();
const {
  getStoryHubs,
  getStoryHubBySlug,
  createStoryHub,
  updateStoryHub,
  deleteStoryHub
} = require('../controllers/storyHubController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getStoryHubs);
router.get('/:slug', getStoryHubBySlug);

router.post('/', protect, authorize('Editor', 'Admin', 'Super Admin'), createStoryHub);
router.put('/:id', protect, authorize('Editor', 'Admin', 'Super Admin'), updateStoryHub);
router.delete('/:id', protect, authorize('Editor', 'Admin', 'Super Admin'), deleteStoryHub);

module.exports = router;
