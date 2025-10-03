const express = require('express');
const router = express.Router();

const {
  getRecommendations,
  askQuestion,
  explainAlgorithm
} = require('../controllers/aiController');

// AI learning recommendations
router.post('/recommendations', getRecommendations);

// AI Q&A about DSA
router.post('/ask', askQuestion);

// AI algorithm explanation
router.post('/explain', explainAlgorithm);

module.exports = router;
