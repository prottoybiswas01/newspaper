const express = require('express');
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  likeArticle,
  shareArticle,
  translateArticle
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getArticles);
router.get('/slug/:slug', getArticleBySlug);
router.post('/translate', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), translateArticle);
router.post('/', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), createArticle);
router.put('/:id', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), updateArticle);
router.delete('/:id', protect, authorize('Editor', 'Admin', 'Super Admin'), deleteArticle);

router.post('/:id/like', likeArticle);
router.post('/:id/share', shareArticle);

module.exports = router;
