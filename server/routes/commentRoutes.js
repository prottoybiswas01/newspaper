const express = require('express');
const router = express.Router();
const {
  getCommentsByArticle,
  createComment,
  getAllComments,
  moderateComment,
  reportComment,
  likeComment,
  deleteComment
} = require('../controllers/commentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/article/:articleId', getCommentsByArticle);
router.post('/', createComment);
router.post('/:id/report', reportComment);
router.post('/:id/like', likeComment);

router.get('/', protect, authorize('Moderator', 'Editor', 'Admin', 'Super Admin'), getAllComments);
router.put('/:id', protect, authorize('Moderator', 'Editor', 'Admin', 'Super Admin'), moderateComment);
router.delete('/:id', protect, authorize('Moderator', 'Editor', 'Admin', 'Super Admin'), deleteComment);

module.exports = router;
