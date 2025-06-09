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
    
    Please provide a detailed, structured response in markdown format that includes:

    ## Learning Path
    - A personalized learning path based on their current level and topic
    - 3-5 specific topics they should focus on next, with brief explanations of why

    ## Practice Problems
    - Recommended practice problems (easy to medium difficulty) with links to platforms like LeetCode or GeeksforGeeks
    - Key concepts they should review, especially in their weak areas

    ## Study Strategy
    - A practical study strategy with time allocation
    - Resources (books, websites, courses) that match their level
    - Tips for effective practice and common pitfalls to avoid

    Format the response in a clear, organized way with proper markdown headings, lists, and emphasis. Make it actionable and specific to their profile.`;

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
    
    Please provide a comprehensive answer in markdown format that includes:

    ## Explanation
    - A clear explanation of the concept
    - Relevant examples with code snippets if applicable

    ## Analysis
    - Time and space complexity analysis
    - Common variations or edge cases

    ## Implementation
    - Best practices and implementation tips
    - Related concepts or algorithms they should know

    ## Practice
    - Practice problems to reinforce understanding
    - Visual explanations or analogies if helpful

    Format the response with proper markdown headings, code blocks, and lists. Make the explanation educational and easy to understand.`;

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

    Please provide a comprehensive explanation in markdown format that includes:

    ## Overview
    - A clear overview of what the algorithm does and its purpose
    - Step-by-step explanation of how it works

    ## Analysis
    - Time and space complexity analysis with explanations
    - Implementation details with code examples

    ## Understanding
    - Visual explanation or analogy to help understand the concept
    - Common variations and optimizations

    ## Applications
    - Real-world applications and use cases
    - Common pitfalls and how to avoid them

    ## Practice
    - Practice problems to master the algorithm
    - Related algorithms they should learn next

    Format the response with proper markdown headings, code blocks, and lists. Make the explanation appropriate for a ${level} level student. Use clear language and provide examples that match their understanding level.`;

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