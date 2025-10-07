const axios = require('axios');
const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');

/**
 * Handles the actual call to the Gemini API
 */
const callGeminiAPI = async (contents) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `${process.env.GEMINI_API_URL}?key=${apiKey}`;

  try {
    const response = await axios.post(
      apiUrl,
      { contents },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0 &&
      response.data.candidates[0].content?.parts?.length > 0
    ) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.error('Invalid response structure from Gemini API:', response.data);
      throw new Error('Received an invalid response from the AI model.');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
    throw new Error('Failed to get AI response');
  }
};

/**
 * Ask Question (multi-turn with context + profile) - Now with database persistence
 */
const askQuestion = async (req, res) => {
  try {
    const { question, conversationHistory = [], userProfile = {}, conversationId } = req.body;
    const userId = req.user?.id;

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User authentication required' });
    }

    let conversation;
    
    // If conversationId is provided, find existing conversation
    if (conversationId) {
      conversation = await ChatConversation.findOne({ 
        _id: conversationId, 
        user: userId 
      });
      
      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
    } else {
      // Create new conversation
      const title = question.substring(0, 50) + (question.length > 50 ? '...' : '');
      conversation = await ChatConversation.create({
        user: userId,
        title: title
      });
    }

    // Save user message to database
    const userMessage = await ChatMessage.create({
      conversation: conversation._id,
      user: userId,
      type: 'user',
      content: question
    });

    // Update conversation's last message timestamp
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const systemPrompt = `You are an expert assistant for Data Structures and Algorithms (DSA) named AlgoBot.

**Your Primary Directives:**
1. **Persona:** Helpful, knowledgeable, and encouraging tutor. Simplify complex topics.
2. **Context:** Review conversation history & user profile before answering.
3. **Response Style:**
   - Brief: 1–2 paragraphs.
   - Detailed: Full explanation with examples.
   - Default: Moderate depth (3–4 paragraphs).
4. **User Profile:** Tailor explanation to level '${userProfile?.level || 'beginner'}'.`;

    // Get conversation history from database if no conversationHistory provided
    let historyToUse = conversationHistory;
    if (conversationHistory.length === 0) {
      const dbMessages = await ChatMessage.find({ conversation: conversation._id })
        .sort({ timestamp: 1 })
        .limit(10); // Limit to last 10 messages for context
      
      historyToUse = dbMessages.map(msg => ({
        role: msg.type === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
    }

    const formattedHistory = historyToUse.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: `${systemPrompt}\n\nQuestion: ${question}` }] }
    ];

    const aiResponse = await callGeminiAPI(contents);

    // Save AI response to database
    const aiMessage = await ChatMessage.create({
      conversation: conversation._id,
      user: userId,
      type: 'assistant',
      content: aiResponse
    });

    // Update conversation title if it's the first message
    if (conversation.messages && conversation.messages.length === 0) {
      conversation.title = question.substring(0, 50) + (question.length > 50 ? '...' : '');
      await conversation.save();
    }

    res.json({ 
      success: true, 
      answer: aiResponse,
      conversationId: conversation._id,
      messageId: aiMessage._id
    });
  } catch (error) {
    console.error('Error in askQuestion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Personalized learning recommendations
 */
const getRecommendations = async (req, res) => {
  try {
    const { userLevel, currentTopics, strengths, weaknesses } = req.body;

    const prompt = `You are an expert DSA tutor. Provide personalized learning recommendations for this student:
- Level: ${userLevel || 'beginner'}
- Current Topics: ${currentTopics || 'general DSA'}
- Strengths: ${strengths || 'none specified'}
- Weaknesses: ${weaknesses || 'none specified'}

Give a structured learning plan in markdown with:
- Key topics to focus on
- LeetCode/DSA problem links
- A practical study strategy
- Encouraging tone`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const aiResponse = await callGeminiAPI(contents);

    res.json({ success: true, recommendations: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Explain Algorithm
 */
const explainAlgorithm = async (req, res) => {
  try {
    const { algorithm, level } = req.body;

    if (!algorithm) {
      return res.status(400).json({ success: false, error: 'Algorithm name is required' });
    }

    const prompt = `You are an expert DSA tutor. Explain the "${algorithm}" algorithm.

Target Level: ${level || 'beginner'}

Provide in markdown:
1. Analogy or overview
2. Core steps
3. Code example (Python or JS)
4. Time & Space Complexity (with reasoning)
5. Common use cases`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const aiResponse = await callGeminiAPI(contents);

    res.json({ success: true, explanation: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user's chat conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User authentication required' });
    }

    const conversations = await ChatConversation.find({ user: userId })
      .sort({ lastMessageAt: -1 })
      .limit(50); // Limit to 50 most recent conversations

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get messages for a specific conversation
 */
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User authentication required' });
    }

    // Verify conversation belongs to user
    const conversation = await ChatConversation.findOne({ 
      _id: conversationId, 
      user: userId 
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const messages = await ChatMessage.find({ conversation: conversationId })
      .sort({ timestamp: 1 });

    res.json({ success: true, messages, conversation });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a conversation
 */
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User authentication required' });
    }

    // Verify conversation belongs to user
    const conversation = await ChatConversation.findOne({ 
      _id: conversationId, 
      user: userId 
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Delete all messages in the conversation
    await ChatMessage.deleteMany({ conversation: conversationId });
    
    // Delete the conversation
    await ChatConversation.findByIdAndDelete(conversationId);

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update conversation title
 */
const updateConversationTitle = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User authentication required' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const conversation = await ChatConversation.findOneAndUpdate(
      { _id: conversationId, user: userId },
      { title: title.trim() },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Error updating conversation title:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getRecommendations,
  askQuestion,
  explainAlgorithm,
  getConversations,
  getConversationMessages,
  deleteConversation,
  updateConversationTitle
};
