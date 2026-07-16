const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  getReporters, 
  getReporterById, 
  getAllUsers, 
  updateUserRole,
  deleteUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.get('/reporters', getReporters);
router.get('/reporters/:id', getReporterById);

// Admin operations
router.get('/users', protect, authorize('Admin', 'Super Admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('Admin', 'Super Admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('Admin', 'Super Admin'), deleteUser);

module.exports = router;
