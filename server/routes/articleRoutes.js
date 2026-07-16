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
  translateArticle,
  getAiArticles,
  triggerAiResearch,
  approveAiArticle,
  rejectAiArticle
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getArticles);
router.get('/slug/:slug', getArticleBySlug);
router.post('/translate', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), translateArticle);
router.post('/', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), createArticle);

// AI Writer endpoints
router.get('/ai/pending', protect, authorize('Editor', 'Admin', 'Super Admin'), getAiArticles);
router.post('/ai/trigger', protect, authorize('Editor', 'Admin', 'Super Admin'), triggerAiResearch);
router.put('/ai/:id/approve', protect, authorize('Editor', 'Admin', 'Super Admin'), approveAiArticle);
router.delete('/ai/:id/reject', protect, authorize('Editor', 'Admin', 'Super Admin'), rejectAiArticle);

router.put('/:id', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), updateArticle);
router.delete('/:id', protect, authorize('Editor', 'Admin', 'Super Admin'), deleteArticle);

router.post('/:id/like', likeArticle);
router.post('/:id/share', shareArticle);

module.exports = router;
