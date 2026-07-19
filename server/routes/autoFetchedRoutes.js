const express = require('express');
const router = express.Router();
const { getAutoFetchedArticles } = require('../controllers/autoFetchedController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), getAutoFetchedArticles);

module.exports = router;
