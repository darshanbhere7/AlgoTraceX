const axios = require('axios');

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
 * Ask Question (multi-turn with context + profile)
 */
const askQuestion = async (req, res) => {
  try {
    const { question, conversationHistory = [], userProfile = {} } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    const systemPrompt = `You are an expert assistant for Data Structures and Algorithms (DSA) named AlgoBot.

**Your Primary Directives:**
1. **Persona:** Helpful, knowledgeable, and encouraging tutor. Simplify complex topics.
2. **Context:** Review conversation history & user profile before answering.
3. **Response Style:**
   - Brief: 1–2 paragraphs.
   - Detailed: Full explanation with examples.
   - Default: Moderate depth (3–4 paragraphs).
4. **User Profile:** Tailor explanation to level '${userProfile?.level || 'beginner'}'.`;

    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: `${systemPrompt}\n\nQuestion: ${question}` }] }
    ];

    const aiResponse = await callGeminiAPI(contents);
    res.json({ success: true, answer: aiResponse });
  } catch (error) {
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

module.exports = {
  getRecommendations,
  askQuestion,
  explainAlgorithm
};
