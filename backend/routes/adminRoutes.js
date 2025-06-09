const express = require('express');
const router = express.Router();
const { 
  getAdminDashboard,
  addTopic,
  getAllTopics,
  deleteTopic,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserAnalytics
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes are protected and admin-only
router.use(protect, adminOnly);

// Dashboard Analytics
router.get('/analytics', getUserAnalytics);

// Topic Management
router.get('/topics', getAllTopics);
router.post('/topics', addTopic);
router.delete('/topics/:id', deleteTopic);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
