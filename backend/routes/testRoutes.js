const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createTest,
  getAllTests,
  getTestByWeek,
  submitTest,
  deleteTest
} = require('../controllers/testController');

// Admin routes
router.post('/', protect, adminOnly, createTest);
router.get('/admin', protect, adminOnly, getAllTests);
router.delete('/:id', protect, adminOnly, deleteTest);

// User routes
router.get('/', protect, getAllTests);
router.get('/:week', protect, getTestByWeek);
router.post('/submit', protect, submitTest);

module.exports = router;
