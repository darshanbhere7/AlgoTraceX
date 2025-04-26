const express = require('express');
const router = express.Router();
const { getAvailableTests, submitTest } = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');

// Weekly Tests for Users
router.get('/', protect, getAvailableTests);      // Get all available tests
router.post('/submit', protect, submitTest);       // Submit a test

module.exports = router;
