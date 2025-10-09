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
 * Ask Question (multi-turn with context + profile + language) - Now with database persistence
 */
const askQuestion = async (req, res) => {
  try {
    const { question, conversationHistory = [], userProfile = {}, conversationId, language = 'English' } = req.body;
    const userId = req.user?.id;

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User authentication required' });
    }

    let conversation;
    
    if (conversationId) {
      conversation = await ChatConversation.findOne({ 
        _id: conversationId, 
        user: userId 
      });
      
      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
    } else {
      const title = question.substring(0, 50) + (question.length > 50 ? '...' : '');
      conversation = await ChatConversation.create({
        user: userId,
        title: title
      });
    }

    const userMessage = await ChatMessage.create({
      conversation: conversation._id,
      user: userId,
      type: 'user',
      content: question
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    const systemPrompt = `You are an expert DSA assistant named AlgoBot.
**Your Directives:**
1. **Persona:** Helpful, encouraging tutor. Simplify complex topics.
2. **Context:** Review conversation history & user profile before answering.
3. **Language:** YOU MUST RESPOND IN THE FOLLOWING LANGUAGE: **${language}**.
4. **User Profile:** Tailor explanation to level '${userProfile?.level || 'beginner'}'.`;

    let historyToUse = conversationHistory;
    if (historyToUse.length === 0) {
      const dbMessages = await ChatMessage.find({ conversation: conversation._id })
        .sort({ timestamp: 1 })
        .limit(10);
      
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

    const aiMessage = await ChatMessage.create({
      conversation: conversation._id,
      user: userId,
      type: 'assistant',
      content: aiResponse
    });

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
 * Personalized learning recommendations (Refined for concise output)
 */
const getRecommendations = async (req, res) => {
  try {
    const { userLevel, currentTopics, strengths, weaknesses } = req.body;

    const prompt = `You are an expert DSA tutor. Provide a **crisp, actionable, and easy-to-understand** learning plan for this student. Use markdown, bullet points, and bold keywords. Be encouraging but direct.

- **Level:** ${userLevel || 'beginner'}
- **Current Topics:** ${currentTopics || 'general DSA'}
- **Strengths:** ${strengths || 'none specified'}
- **Weaknesses:** ${weaknesses || 'none specified'}

**Your output must be structured as follows:**
1.  **Top 3 Focus Areas:** List the 3 most important topics to master next.
2.  **Practice Problems:** Suggest 2-3 specific LeetCode problems (with links) for their level.
3.  **Key Strategy:** Give one practical, powerful tip for their study approach.
4.  **Quick Encouragement:** A single sentence to motivate them.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const aiResponse = await callGeminiAPI(contents);

    res.json({ success: true, recommendations: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Explain Algorithm (Refined for level-specific, concise output)
 */
const explainAlgorithm = async (req, res) => {
  try {
    const { algorithm, level } = req.body;

    if (!algorithm) {
      return res.status(400).json({ success: false, error: 'Algorithm name is required' });
    }

    let levelInstructions;
    switch(level) {
      case 'advanced':
        levelInstructions = "Focus on nuance. Compare it to other algorithms, discuss optimized implementations, edge cases, and advanced use-cases. Keep the explanation dense and professional.";
        break;
      case 'intermediate':
        levelInstructions = "Assume basic data structures are known. Provide a clear code example (JS or Python), and explain the 'why' behind the steps. The complexity analysis should be detailed.";
        break;
      default: // beginner
        levelInstructions = "Use a very simple analogy. Explain the core idea in 1-2 sentences. Show a simple code example with clear comments. The complexity explanation should be high-level and intuitive.";
        break;
    }

    const prompt = `You are an expert DSA tutor. Explain the **"${algorithm}"** algorithm. Your response must be **concise, clear, and strictly tailored** to the target level.

**Target Level: ${level || 'beginner'}**
${levelInstructions}

**Required Markdown Format:**
- **Analogy:** A simple, one-sentence analogy.
- **Core Idea:** A brief explanation of the steps.
- **Code Example:** A short, well-commented code block in Python or JavaScript.
- **Complexity:** Time & Space complexity (e.g., O(n log n)) with a brief justification.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const aiResponse = await callGeminiAPI(contents);

    res.json({ success: true, explanation: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// **RE-ADD a textToSpeech function, but now as a proxy**
const textToSpeech = async (req, res) => {
  try {
    const { text, lang } = req.body;
    if (!text || !lang) {
      return res.status(400).json({ error: 'Text and language code are required' });
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

    const response = await axios.get(url, { responseType: 'stream' });
    
    res.setHeader('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying Google TTS:', error.message);
    res.status(500).json({ error: 'Failed to fetch speech audio' });
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
      .limit(50);

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

    const conversation = await ChatConversation.findOne({ 
      _id: conversationId, 
      user: userId 
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    await ChatMessage.deleteMany({ conversation: conversationId });
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
  updateConversationTitle,
  textToSpeech
};