const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  fetchQuestionDetails,
  markQuestionComplete,
  getCompletedQuestions,
  unmarkQuestionComplete
} = require('../controllers/practiceQuestionController');

// Public routes (protected as all practice questions require authentication)
router.get('/', protect, getAllQuestions);
router.get('/:id', protect, getQuestion);

// Tracking routes (user specific)
router.post('/tracking/questions', protect, markQuestionComplete);
router.get('/tracking/questions', protect, getCompletedQuestions);
router.delete('/tracking/questions/:id', protect, unmarkQuestionComplete);

// Admin routes
router.post('/', protect, adminOnly, createQuestion);
router.post('/fetch', protect, adminOnly, fetchQuestionDetails);
router.put('/:id', protect, adminOnly, updateQuestion);
router.delete('/:id', protect, adminOnly, deleteQuestion);

module.exports = router; 