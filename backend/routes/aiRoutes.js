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
  textToSpeech // **Re-add the import**
} = require('../controllers/aiController');

// AI learning recommendations
router.post('/recommendations', getRecommendations);

// AI Q&A about DSA - Now with authentication
router.post('/ask', protect, askQuestion);

// AI algorithm explanation
router.post('/explain', explainAlgorithm);

// **RE-ADD THE ROUTE FOR TEXT-TO-SPEECH PROXY**
router.post('/text-to-speech', protect, textToSpeech);

// Chat conversation management routes
router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId/messages', protect, getConversationMessages);
router.delete('/conversations/:conversationId', protect, deleteConversation);
router.put('/conversations/:conversationId/title', protect, updateConversationTitle);

module.exports = router;