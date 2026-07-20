const express = require('express');
const router = express.Router();
const { 
  getAutoFetchedArticles, 
  deleteAutoFetchedArticle,
  getAutoFetchStatus,
  toggleAutoFetchStatus,
  triggerAutoFetch,
  extractFullArticleContent
} = require('../controllers/autoFetchedController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), getAutoFetchedArticles);
router.get('/status', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), getAutoFetchStatus);
router.post('/status', protect, authorize('Editor', 'Admin', 'Super Admin'), toggleAutoFetchStatus);
router.post('/trigger', protect, authorize('Editor', 'Admin', 'Super Admin'), triggerAutoFetch);
router.post('/extract', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), extractFullArticleContent);
router.delete('/:id', protect, authorize('Editor', 'Admin', 'Super Admin'), deleteAutoFetchedArticle);

module.exports = router;
