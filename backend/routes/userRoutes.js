const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProgress } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private (Protected by JWT)
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/user/progress
// @desc    Update user progress
// @access  Private (Protected by JWT)
router.put('/progress', protect, updateUserProgress);

module.exports = router;
