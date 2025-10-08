const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getRecommendations,
  askQuestion,
  explainAlgorithm,
  getConversations,
  getConversationMessages,
  deleteConversation,
  updateConversationTitle,
  textToSpeech // **Import the new function**
} = require('../controllers/aiController');

// AI learning recommendations
router.post('/recommendations', getRecommendations);

// AI Q&A about DSA - Now with authentication
router.post('/ask', protect, askQuestion);

// AI algorithm explanation
router.post('/explain', explainAlgorithm);

// **NEW ROUTE FOR TEXT-TO-SPEECH**
router.post('/text-to-speech', protect, textToSpeech);

// Chat conversation management routes
router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId/messages', protect, getConversationMessages);
router.delete('/conversations/:conversationId', protect, deleteConversation);
router.put('/conversations/:conversationId/title', protect, updateConversationTitle);

module.exports = router;