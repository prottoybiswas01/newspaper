const express = require('express');
const router = express.Router();
const { getAutoFetchedArticles, deleteAutoFetchedArticle } = require('../controllers/autoFetchedController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), getAutoFetchedArticles);
router.delete('/:id', protect, authorize('Editor', 'Admin', 'Super Admin'), deleteAutoFetchedArticle);

module.exports = router;
