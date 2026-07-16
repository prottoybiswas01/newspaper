const express = require('express');
const router = express.Router();
const {
  getActivePoll,
  votePoll,
  getAllPolls,
  createPoll,
  updatePoll,
  deletePoll
} = require('../controllers/pollController');
const { protect, authorize } = require('../middleware/auth');

router.get('/active', getActivePoll);
router.post('/:id/vote', votePoll);

// CMS administration
router.get('/', protect, authorize('Editor', 'Moderator', 'Admin', 'Super Admin'), getAllPolls);
router.post('/', protect, authorize('Editor', 'Moderator', 'Admin', 'Super Admin'), createPoll);
router.put('/:id', protect, authorize('Editor', 'Moderator', 'Admin', 'Super Admin'), updatePoll);
router.delete('/:id', protect, authorize('Editor', 'Moderator', 'Admin', 'Super Admin'), deletePoll);

module.exports = router;
