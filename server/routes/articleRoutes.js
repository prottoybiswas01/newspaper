const express = require('express');
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticleBySlug,
  getHomepageData,
  updateArticle,
  deleteArticle,
  likeArticle,
  shareArticle,
  translateArticle,
  restoreRevision,
  addCorrection,
  generateSummary
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/homepage', getHomepageData);
router.get('/', getArticles);
router.get('/slug/:slug', getArticleBySlug);
router.post('/translate', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), translateArticle);
router.post('/generate-summary', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), generateSummary);
router.post('/', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), createArticle);

router.put('/:id', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), updateArticle);
router.post('/:id/restore-revision', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), restoreRevision);
router.post('/:id/correction', protect, authorize('Editor', 'Admin', 'Super Admin'), addCorrection);
router.delete('/:id', protect, authorize('Editor', 'Admin', 'Super Admin'), deleteArticle);

router.post('/:id/like', likeArticle);
router.post('/:id/share', shareArticle);

module.exports = router;
