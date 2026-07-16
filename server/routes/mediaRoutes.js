const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getMediaFiles,
  deleteMediaFile
} = require('../controllers/mediaController');
const { protect, authorize } = require('../middleware/auth');

router.post('/upload', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), uploadFile);
router.get('/', protect, authorize('Reporter', 'Editor', 'Admin', 'Super Admin'), getMediaFiles);
router.delete('/:filename', protect, authorize('Editor', 'Admin', 'Super Admin'), deleteMediaFile);

module.exports = router;
