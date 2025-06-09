const express = require('express');
const router = express.Router();

// Import controller functions directly to avoid potential export issues
const { getRecommendations, askQuestion, explainAlgorithm } = require('../controllers/aiController');

// Route for getting AI recommendations
router.post('/recommendations', getRecommendations);

// Route for asking AI questions about DSA concepts
router.post('/ask', askQuestion);

// Route for getting algorithm explanations
router.post('/explain', explainAlgorithm);

module.exports = router;