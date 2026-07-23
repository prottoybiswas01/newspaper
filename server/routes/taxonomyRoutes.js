const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  mergeTags
} = require('../controllers/taxonomyController');
const { protect, authorize } = require('../middleware/auth');

// Categories
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('Editor', 'Admin', 'Super Admin'), createCategory);
router.put('/categories/:id', protect, authorize('Editor', 'Admin', 'Super Admin'), updateCategory);
router.delete('/categories/:id', protect, authorize('Editor', 'Admin', 'Super Admin'), deleteCategory);

// Subcategories
router.post('/categories/:id/subcategories', protect, authorize('Editor', 'Admin', 'Super Admin'), addSubcategory);
router.put('/categories/:id/subcategories/:subId', protect, authorize('Editor', 'Admin', 'Super Admin'), updateSubcategory);
router.delete('/categories/:id/subcategories/:subId', protect, authorize('Editor', 'Admin', 'Super Admin'), deleteSubcategory);

// Tags
router.get('/tags', getTags);
router.post('/tags', protect, authorize('Editor', 'Admin', 'Super Admin', 'SEO Manager'), createTag);
router.put('/tags/:id', protect, authorize('Editor', 'Admin', 'Super Admin', 'SEO Manager'), updateTag);
router.delete('/tags/:id', protect, authorize('Editor', 'Admin', 'Super Admin', 'SEO Manager'), deleteTag);
router.post('/tags/merge', protect, authorize('Editor', 'Admin', 'Super Admin'), mergeTags);

module.exports = router;
