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

/**
 * AI-powered CodeView features using Gemini API
 */

const ensureCodePayload = (req, res) => {
  const code = req.body?.code;
  const language = req.body?.language || 'javascript';

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    res.status(400).json({ message: 'Code is required.' });
    return null;
  }

  return { code, language };
};

/**
 * Explain Code - AI-powered explanation
 */
const explainCodeStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const prompt = `You are an expert code reviewer. Explain the following ${payload.language} code in detail.

Code:
\`\`\`${payload.language}
${payload.code}
\`\`\`

Provide a clear, comprehensive explanation that includes:
1. What the code does overall
2. Line-by-line or block-by-block breakdown
3. Key concepts and patterns used
4. Any important details about the implementation

Format your response as clear, readable text with proper structure.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const explanation = await callGeminiAPI(contents);

    res.json({ 
      result: {
        explanation: explanation || 'Unable to generate explanation.',
        lines: payload.code.split('\n').map((line, idx) => ({
          number: idx + 1,
          content: line
        }))
      }
    });
  } catch (error) {
    console.error('Error in explainCodeStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to explain code.' });
  }
};

/**
 * Optimize Code - AI-powered optimization
 */
const optimizeCodeStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const prompt = `You are an expert code optimizer. Optimize the following ${payload.language} code for better performance, readability, and best practices.

Original Code:
\`\`\`${payload.language}
${payload.code}
\`\`\`

Provide:
1. The optimized code (complete, runnable code)
2. A clear explanation of what optimizations were made and why

Format your response as JSON with this structure:
{
  "optimizedCode": "the complete optimized code here",
  "explanation": "detailed explanation of optimizations"
}

Return ONLY valid JSON, no markdown formatting.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    let response = await callGeminiAPI(contents);

    // Try to extract JSON from response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          result: {
            optimizedCode: parsed.optimizedCode || payload.code,
            explanation: parsed.explanation || 'Optimizations applied.'
          }
        });
      } else {
        // Fallback: extract code blocks
        const codeMatch = response.match(/```[\s\S]*?```/);
        res.json({ 
          result: {
            optimizedCode: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim() : payload.code,
            explanation: response.replace(/```[\s\S]*?```/g, '').trim() || 'Optimizations applied.'
          }
        });
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract code from markdown
      const codeMatch = response.match(/```[\s\S]*?```/);
      res.json({ 
        result: {
          optimizedCode: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim() : payload.code,
          explanation: response.replace(/```[\s\S]*?```/g, '').trim() || 'Optimizations applied.'
        }
      });
    }
  } catch (error) {
    console.error('Error in optimizeCodeStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to optimize code.' });
  }
};

/**
 * Detect Bugs - AI-powered bug detection
 */
const detectBugsStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const prompt = `You are an expert code reviewer. Analyze the following ${payload.language} code and find all potential bugs, errors, and issues.

Code:
\`\`\`${payload.language}
${payload.code}
\`\`\`

Provide a detailed analysis in JSON format:
{
  "bugs": [
    {
      "title": "Bug title",
      "description": "Detailed description of the bug and how to fix it"
    }
  ],
  "summary": "Overall summary of findings"
}

Return ONLY valid JSON, no markdown formatting.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    let response = await callGeminiAPI(contents);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          result: {
            bugs: Array.isArray(parsed.bugs) ? parsed.bugs : [],
            summary: parsed.summary || 'Bug analysis completed.'
          }
        });
      } else {
        res.json({ 
          result: {
            bugs: [{ title: 'Analysis Result', description: response }],
            summary: 'Bug analysis completed.'
          }
        });
      }
    } catch (parseError) {
      res.json({ 
        result: {
          bugs: [{ title: 'Analysis Result', description: response }],
          summary: 'Bug analysis completed.'
        }
      });
    }
  } catch (error) {
    console.error('Error in detectBugsStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to detect bugs.' });
  }
};

/**
 * Generate Test Cases - AI-powered test case generation
 */
const generateTestcasesStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const prompt = `You are an expert test engineer. Generate comprehensive test cases for the following ${payload.language} code.

Code:
\`\`\`${payload.language}
${payload.code}
\`\`\`

Generate test cases in JSON format:
{
  "testcases": [
    {
      "id": "test1",
      "title": "Test case title",
      "description": "What this test case validates",
      "input": "input value or format",
      "expected": "expected output"
    }
  ]
}

Include:
- Happy path cases
- Edge cases
- Boundary conditions
- Error cases (if applicable)

Return ONLY valid JSON, no markdown formatting.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    let response = await callGeminiAPI(contents);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          result: {
            testcases: Array.isArray(parsed.testcases) ? parsed.testcases : []
          }
        });
      } else {
        // Fallback test cases
        res.json({ 
          result: {
            testcases: [
              { id: 'basic', title: 'Basic Case', description: 'Normal input scenario', input: 'Standard input', expected: 'Expected output' },
              { id: 'edge', title: 'Edge Case', description: 'Boundary condition', input: 'Edge input', expected: 'Edge output' }
            ]
          }
        });
      }
    } catch (parseError) {
      res.json({ 
        result: {
          testcases: [
            { id: 'basic', title: 'Basic Case', description: 'Normal input scenario', input: 'Standard input', expected: 'Expected output' },
            { id: 'edge', title: 'Edge Case', description: 'Boundary condition', input: 'Edge input', expected: 'Edge output' }
          ]
        }
      });
    }
  } catch (error) {
    console.error('Error in generateTestcasesStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to generate test cases.' });
  }
};

/**
 * Simulate Input - AI-powered code simulation
 */
const simulateInputStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const userInput = req.body?.input || '';
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
      return res.status(400).json({ message: 'Input is required for simulation.' });
    }

    // Validate JSON input
    let parsedInput;
    try {
      parsedInput = JSON.parse(userInput);
    } catch (e) {
      // If not JSON, use as string
      parsedInput = userInput;
    }

    const prompt = `You are an expert code executor. Simulate the execution of the following ${payload.language} code with the given input.

Code:
\`\`\`${payload.language}
${payload.code}
\`\`\`

Input:
${JSON.stringify(parsedInput, null, 2)}

Provide a step-by-step simulation in JSON format:
{
  "steps": ["step 1", "step 2", ...],
  "variables": {"var1": "value1", ...},
  "notes": "summary notes"
}

Trace through the execution and show:
1. Execution steps
2. Variable states at key points
3. Final output or result

Return ONLY valid JSON, no markdown formatting.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    let response = await callGeminiAPI(contents);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          result: {
            steps: Array.isArray(parsed.steps) ? parsed.steps : [],
            variables: parsed.variables || { input: parsedInput },
            notes: parsed.notes || 'Simulation completed.'
          }
        });
      } else {
        res.json({ 
          result: {
            steps: ['Parsed input', 'Executed code', 'Generated output'],
            variables: { input: parsedInput },
            notes: response || 'Simulation completed.'
          }
        });
      }
    } catch (parseError) {
      res.json({ 
        result: {
          steps: ['Parsed input', 'Executed code', 'Generated output'],
          variables: { input: parsedInput },
          notes: response || 'Simulation completed.'
        }
      });
    }
  } catch (error) {
    console.error('Error in simulateInputStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to simulate input.' });
  }
};

/**
 * Fix Code - AI-powered code fixing
 */
const fixCodeStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const prompt = `You are an expert debugger. Fix all errors, bugs, and issues in the following ${payload.language} code.

Code:
\`\`\`${payload.language}
${payload.code}
\`\`\`

Provide the fixed code in JSON format:
{
  "fixedCode": "the complete fixed code here",
  "explanation": "detailed explanation of what was fixed and why"
}

Return ONLY valid JSON, no markdown formatting.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    let response = await callGeminiAPI(contents);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          result: {
            fixedCode: parsed.fixedCode || payload.code,
            explanation: parsed.explanation || 'Code fixes applied.'
          }
        });
      } else {
        // Extract code from markdown
        const codeMatch = response.match(/```[\s\S]*?```/);
        res.json({ 
          result: {
            fixedCode: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim() : payload.code,
            explanation: response.replace(/```[\s\S]*?```/g, '').trim() || 'Code fixes applied.'
          }
        });
      }
    } catch (parseError) {
      const codeMatch = response.match(/```[\s\S]*?```/);
      res.json({ 
        result: {
          fixedCode: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim() : payload.code,
          explanation: response.replace(/```[\s\S]*?```/g, '').trim() || 'Code fixes applied.'
        }
      });
    }
  } catch (error) {
    console.error('Error in fixCodeStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to fix code.' });
  }
};

/**
 * Analyze Complexity - AI-powered complexity analysis
 */
const analyzeComplexityStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const prompt = `You are an expert algorithm analyst. Analyze the time and space complexity of the following ${payload.language} code.

Code:
\`\`\`${payload.language}
${payload.code}
\`\`\`

Provide analysis in JSON format:
{
  "time": "O(n) or appropriate complexity notation",
  "space": "O(1) or appropriate complexity notation",
  "reasoning": "detailed explanation of why these complexities"
}

Return ONLY valid JSON, no markdown formatting.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    let response = await callGeminiAPI(contents);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          result: {
            time: parsed.time || 'O(n)',
            space: parsed.space || 'O(1)',
            reasoning: parsed.reasoning || 'Complexity analysis completed.'
          }
        });
      } else {
        res.json({ 
          result: {
            time: 'O(n)',
            space: 'O(1)',
            reasoning: response || 'Complexity analysis completed.'
          }
        });
      }
    } catch (parseError) {
      res.json({ 
        result: {
          time: 'O(n)',
          space: 'O(1)',
          reasoning: response || 'Complexity analysis completed.'
        }
      });
    }
  } catch (error) {
    console.error('Error in analyzeComplexityStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to analyze complexity.' });
  }
};

/**
 * Generate Comments - AI-powered comment generation
 */
const generateCommentsStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const prompt = `You are an expert code documenter. Add comprehensive comments and documentation to the following ${payload.language} code.

Code:
\`\`\`${payload.language}
${payload.code}
\`\`\`

Provide the commented code in JSON format:
{
  "commentedCode": "code with comments added",
  "docstring": "function/class docstring if applicable",
  "summary": "summary of documentation added"
}

Return ONLY valid JSON, no markdown formatting.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    let response = await callGeminiAPI(contents);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          result: {
            commentedCode: parsed.commentedCode || payload.code,
            docstring: parsed.docstring || '',
            summary: parsed.summary || 'Comments generated.'
          }
        });
      } else {
        const codeMatch = response.match(/```[\s\S]*?```/);
        res.json({ 
          result: {
            commentedCode: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim() : payload.code,
            docstring: '',
            summary: response.replace(/```[\s\S]*?```/g, '').trim() || 'Comments generated.'
          }
        });
      }
    } catch (parseError) {
      const codeMatch = response.match(/```[\s\S]*?```/);
      res.json({ 
        result: {
          commentedCode: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim() : payload.code,
          docstring: '',
          summary: response.replace(/```[\s\S]*?```/g, '').trim() || 'Comments generated.'
        }
      });
    }
  } catch (error) {
    console.error('Error in generateCommentsStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to generate comments.' });
  }
};

/**
 * Code Recommendations - AI-powered recommendations
 */
const codeRecommendationsStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const prompt = `You are an expert DSA tutor. Analyze the following ${payload.language} code and provide learning recommendations.

Code:
\`\`\`${payload.language}
${payload.code}
\`\`\`

Provide recommendations in JSON format:
{
  "topics": ["topic1", "topic2", ...],
  "questions": ["practice question 1", "practice question 2", ...],
  "mistakes": ["common mistake 1", "common mistake 2", ...]
}

Return ONLY valid JSON, no markdown formatting.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    let response = await callGeminiAPI(contents);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          result: {
            topics: Array.isArray(parsed.topics) ? parsed.topics : [],
            questions: Array.isArray(parsed.questions) ? parsed.questions : [],
            mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : []
          }
        });
      } else {
        res.json({ 
          result: {
            topics: ['Data Structures', 'Algorithms'],
            questions: ['Practice problem solving'],
            mistakes: ['Review code for improvements']
          }
        });
      }
    } catch (parseError) {
      res.json({ 
        result: {
          topics: ['Data Structures', 'Algorithms'],
          questions: ['Practice problem solving'],
          mistakes: ['Review code for improvements']
        }
      });
    }
  } catch (error) {
    console.error('Error in codeRecommendationsStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to generate recommendations.' });
  }
};

/**
 * Convert Language - AI-powered code conversion
 */
const convertLanguageStatic = async (req, res) => {
  try {
    const payload = ensureCodePayload(req, res);
    if (!payload) return;

    const targetLanguage = req.body?.targetLanguage;
    if (!targetLanguage || typeof targetLanguage !== 'string' || targetLanguage.trim().length === 0) {
      return res.status(400).json({ message: 'Target language is required.' });
    }

    const source = payload.language.toLowerCase();
    const target = targetLanguage.toLowerCase();

    if (source === target) {
      return res.status(400).json({ message: 'Source and target languages must differ.' });
    }

    const prompt = `You are an expert code translator. Convert the following ${source} code to ${target}.

Original Code (${source}):
\`\`\`${source}
${payload.code}
\`\`\`

Provide the converted code in JSON format:
{
  "convertedCode": "the complete converted code in ${target}",
  "targetLanguage": "${target}"
}

Make sure the conversion:
1. Maintains the same logic and functionality
2. Uses idiomatic ${target} syntax
3. Preserves all comments and structure
4. Is complete and runnable

Return ONLY valid JSON, no markdown formatting.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    let response = await callGeminiAPI(contents);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          result: {
            convertedCode: parsed.convertedCode || payload.code,
            targetLanguage: parsed.targetLanguage || target
          }
        });
      } else {
        // Extract code from markdown
        const codeMatch = response.match(/```[\s\S]*?```/);
        res.json({ 
          result: {
            convertedCode: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim() : payload.code,
            targetLanguage: target
          }
        });
      }
    } catch (parseError) {
      const codeMatch = response.match(/```[\s\S]*?```/);
      res.json({ 
        result: {
          convertedCode: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim() : payload.code,
          targetLanguage: target
        }
      });
    }
  } catch (error) {
    console.error('Error in convertLanguageStatic:', error);
    res.status(500).json({ message: error.message || 'Failed to convert code.' });
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
  textToSpeech,
  explainCodeStatic,
  optimizeCodeStatic,
  detectBugsStatic,
  generateTestcasesStatic,
  simulateInputStatic,
  fixCodeStatic,
  analyzeComplexityStatic,
  generateCommentsStatic,
  codeRecommendationsStatic,
  convertLanguageStatic,
};