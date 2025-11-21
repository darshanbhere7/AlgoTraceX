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
  textToSpeech, // **Re-add the import**
  explainCodeStatic,
  optimizeCodeStatic,
  detectBugsStatic,
  generateTestcasesStatic,
  simulateInputStatic,
  fixCodeStatic,
  analyzeComplexityStatic,
  generateCommentsStatic,
  codeRecommendationsStatic,
  convertLanguageStatic
} = require('../controllers/aiController');

// AI learning recommendations
router.post('/recommendations', getRecommendations);

// AI Q&A about DSA - Now with authentication
router.post('/ask', protect, askQuestion);

// AI algorithm explanation
router.post('/explain', explainAlgorithm);

// **RE-ADD THE ROUTE FOR TEXT-TO-SPEECH PROXY**
router.post('/text-to-speech', protect, textToSpeech);

// Lightweight AI endpoints for CodeView
router.post('/explain-code', explainCodeStatic);
router.post('/optimize-code', optimizeCodeStatic);
router.post('/find-bugs', detectBugsStatic);
router.post('/generate-testcases', generateTestcasesStatic);
router.post('/simulate-input', simulateInputStatic);
router.post('/fix-code', fixCodeStatic);
router.post('/analyze-complexity', analyzeComplexityStatic);
router.post('/generate-comments', generateCommentsStatic);
router.post('/code-recommendations', codeRecommendationsStatic);
router.post('/convert-language', convertLanguageStatic);

// Chat conversation management routes
router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId/messages', protect, getConversationMessages);
router.delete('/conversations/:conversationId', protect, deleteConversation);
router.put('/conversations/:conversationId/title', protect, updateConversationTitle);

module.exports = router;