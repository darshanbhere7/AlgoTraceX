const express = require('express');
const router = express.Router();
const { getAllTopics } = require('../controllers/adminController');

// Public route to get all topics
router.get('/', getAllTopics);

module.exports = router; 