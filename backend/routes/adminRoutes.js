const express = require('express');
const router = express.Router();
const { createTest, getAllTests } = require('../controllers/testController');
const { getAllUsers, updateUserRole, getUserAnalytics } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes are protected and admin-only

// Test Management
router.post('/tests', protect, adminOnly, createTest);
router.get('/tests', protect, adminOnly, getAllTests);

// User Management
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUserRole);

// Analytics
router.get('/analytics', protect, adminOnly, getUserAnalytics);

module.exports = router;
