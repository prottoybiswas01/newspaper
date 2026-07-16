const express = require('express');
const router = express.Router();
const {
  getCommentsByArticle,
  createComment,
  getAllComments,
  moderateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/article/:articleId', getCommentsByArticle);
router.post('/', createComment);

// Moderation dashboard routes
router.get('/', protect, authorize('Editor', 'Moderator', 'Admin', 'Super Admin'), getAllComments);
router.put('/:id', protect, authorize('Editor', 'Moderator', 'Admin', 'Super Admin'), moderateComment);
router.delete('/:id', protect, authorize('Editor', 'Moderator', 'Admin', 'Super Admin'), deleteComment);

module.exports = router;
