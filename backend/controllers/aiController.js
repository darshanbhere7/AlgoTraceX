const axios = require('axios');

const callGeminiAPI = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  try {
    const response = await axios.post(
      `${apiUrl}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
    throw new Error('Failed to get AI response');
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { userLevel, currentTopic, strengths, weaknesses } = req.body;

    const prompt = `You are an expert DSA (Data Structures and Algorithms) tutor. Provide personalized learning recommendations for a student with the following profile:
    
    Level: ${userLevel || 'beginner'}
    Current Topic: ${currentTopic || 'general DSA'}
    Strengths: ${strengths || 'none specified'}
    Weaknesses: ${weaknesses || 'none specified'}
    
    Please provide a detailed, structured response that includes:
    1. A personalized learning path based on their current level and topic
    2. 3-5 specific topics they should focus on next, with brief explanations of why
    3. Recommended practice problems (easy to medium difficulty) with links to platforms like LeetCode or GeeksforGeeks
    4. Key concepts they should review, especially in their weak areas
    5. A practical study strategy with time allocation
    6. Resources (books, websites, courses) that match their level
    7. Tips for effective practice and common pitfalls to avoid
    
    Format the response in a clear, organized way with sections and bullet points. Make it actionable and specific to their profile.`;

    const aiResponse = await callGeminiAPI(prompt);

    res.json({
      success: true,
      recommendations: aiResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const askQuestion = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    const prompt = `You are an expert DSA tutor. Answer the following question about data structures and algorithms:

    Question: ${question}
    ${context ? `Context: ${context}` : ''}
    
    Please provide a comprehensive answer that includes:
    1. A clear explanation of the concept
    2. Relevant examples with code snippets if applicable
    3. Time and space complexity analysis
    4. Common variations or edge cases
    5. Best practices and implementation tips
    6. Related concepts or algorithms they should know
    7. Practice problems to reinforce understanding
    
    Make the explanation educational and easy to understand. Include visual explanations or analogies if helpful.`;

    const aiResponse = await callGeminiAPI(prompt);

    res.json({
      success: true,
      answer: aiResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const explainAlgorithm = async (req, res) => {
  try {
    const { algorithm, level } = req.body;

    if (!algorithm) {
      return res.status(400).json({
        success: false,
        error: 'Algorithm name is required'
      });
    }

    const prompt = `You are an expert DSA tutor. Explain the ${algorithm} algorithm for a ${level || 'beginner'} level student.

    Please provide a comprehensive explanation that includes:
    1. A clear overview of what the algorithm does and its purpose
    2. Step-by-step explanation of how it works
    3. Time and space complexity analysis with explanations
    4. Implementation details with code examples
    5. Visual explanation or analogy to help understand the concept
    6. Common variations and optimizations
    7. Real-world applications and use cases
    8. Common pitfalls and how to avoid them
    9. Practice problems to master the algorithm
    10. Related algorithms they should learn next
    
    Make the explanation appropriate for a ${level} level student. Use clear language and provide examples that match their understanding level.`;

    const aiResponse = await callGeminiAPI(prompt);

    res.json({
      success: true,
      explanation: aiResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getRecommendations,
  askQuestion,
  explainAlgorithm
};