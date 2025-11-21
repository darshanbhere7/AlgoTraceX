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
 * Lightweight, rule-based AI helpers for CodeView features
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

const buildResult = (res, payload) => res.json({ result: payload });

const explainCodeStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const lines = payload.code.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return `Line ${idx + 1}: (blank line)`;
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      return `Line ${idx + 1}: Comment detected – ${trimmed}`;
    }
    return `Line ${idx + 1}: ${trimmed}`;
  });

  buildResult(res, {
    explanation:
      'Line-by-line breakdown generated using heuristic analysis (no external AI).',
    lines,
  });
};

const optimizeCodeStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const optimizedCode = payload.code
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
    .join('\n');

  buildResult(res, {
    optimizedCode,
    explanation:
      'Removed trailing spaces and collapsed consecutive blank lines for readability.',
  });
};

const detectBugsStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const bugs = [];
  if (/while\s*\(\s*true\s*\)/i.test(payload.code) || /for\s*\(\s*;\s*;\s*\)/.test(payload.code)) {
    bugs.push('Potential infinite loop detected. Verify termination conditions.');
  }
  if (/indexOf\(.*-1\)/.test(payload.code)) {
    bugs.push('Possible negative index usage. Ensure bounds are validated.');
  }
  if (/System\.out\.println\(\s*\)/.test(payload.code)) {
    bugs.push('Empty println call found. Check if this is intentional.');
  }
  if (bugs.length === 0) {
    bugs.push('No obvious issues detected via static heuristics.');
  }

  buildResult(res, {
    bugs,
    summary:
      'This lightweight scan uses regex-based heuristics. Please run formal tests to confirm.',
  });
};

const generateTestcasesStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const base = [
    {
      id: 'basic',
      title: 'Basic case',
      description: 'Nominal scenario to verify core logic.',
      input: '1 2 3',
      expected: 'Result for basic input',
    },
    {
      id: 'edge',
      title: 'Edge case',
      description: 'Boundary values to exercise edge conditions.',
      input: '0 0 0',
      expected: 'Edge-case handling output',
    },
    {
      id: 'stress',
      title: 'Stress test',
      description: 'Large payload to verify performance.',
      input: '[1000 random numbers]',
      expected: 'Expected aggregated result',
    },
  ];

  buildResult(res, { testcases: base });
};

const simulateInputStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const userInput = req.body?.input || '';
  let parsedInput = userInput;

  if (typeof userInput === 'string') {
    try {
      parsedInput = JSON.parse(userInput);
    } catch {
      parsedInput = userInput;
    }
  }

  const steps = [
    'Received user input and initialized simulation context.',
    'Parsed input payload and mapped to local variables.',
    'Traversed control structures heuristically (simulation placeholder).',
    'Simulation completed. Review variable snapshots for insights.',
  ];

  buildResult(res, {
    steps,
    variables: {
      input: parsedInput,
      note: 'This is a static simulation preview. Integrate with real runner for exact states.',
    },
    notes:
      'The AI input simulator currently uses deterministic heuristics. Extend with real execution engine for full fidelity.',
  });
};

const fixCodeStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const fixedCode = `// AI Fix Suggestion\n${payload.code}`;
  buildResult(res, {
    fixedCode,
    explanation:
      'Prepended a fix suggestion comment. Integrate linting/formatting for deeper fixes.',
  });
};

const analyzeComplexityStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const hasNestedLoop =
    /(for|while)[^{]*{[^{}]*(for|while)/.test(payload.code) ||
    /(for|while)[^{]*\n\s*(for|while)/.test(payload.code);
  const hasSingleLoop = /(for|while)/.test(payload.code);
  const isRecursive = /function\s+\w+\s*\([^)]*\)\s*{[^}]*\w+\s*\(/.test(payload.code) || /public\s+\w+\s+\w+\s*\([^)]*\)\s*{[^}]*\bthis\b/.test(payload.code);

  let time = 'O(1)';
  if (hasNestedLoop) time = 'O(n^2) (nested loops detected heuristically)';
  else if (hasSingleLoop) time = 'O(n) (single loop detected)';
  else if (isRecursive) time = 'O(n) (simple recursion detected)';

  const space = isRecursive
    ? 'O(n) (recursive call stack)'
    : hasNestedLoop || hasSingleLoop
    ? 'O(1) unless additional structures added'
    : 'O(1)';

  buildResult(res, {
    time,
    space,
    reasoning:
      'Complexity derived from pattern matching on loops and recursion keywords. Review manually for accuracy.',
  });
};

const generateCommentsStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const commentedCode = payload.code
    .split('\n')
    .map((line) => (line.trim().length ? `// TODO: describe -> ${line}` : line))
    .join('\n');

  buildResult(res, {
    commentedCode,
    summary: 'Inserted TODO comments as placeholders. Replace with meaningful docs.',
    docstring: `/**\n * Auto-generated summary for ${payload.language} snippet.\n */`,
  });
};

const codeRecommendationsStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const lower = payload.code.toLowerCase();
  const topics = [];
  if (lower.includes('tree')) topics.push('Trees & Traversals');
  if (lower.includes('graph')) topics.push('Graphs & BFS/DFS');
  if (lower.includes('sort')) topics.push('Sorting Techniques');
  if (lower.includes('dp')) topics.push('Dynamic Programming');
  if (topics.length === 0) topics.push('Data Structures Basics');

  const questions = [
    'Practice: Two Sum (Arrays)',
    'Practice: Binary Tree Level Order Traversal',
    'Practice: Longest Substring Without Repeating Characters',
    'Practice: Merge Intervals',
    'Practice: Implement LRU Cache',
  ];

  const mistakes = [
    'Overlooking null/empty input handling.',
    'Not validating index bounds on arrays/lists.',
    'Skipping time complexity considerations.',
  ];

  buildResult(res, {
    topics,
    questions,
    mistakes,
  });
};

const convertLanguageStatic = (req, res) => {
  const payload = ensureCodePayload(req, res);
  if (!payload) return;

  const source = payload.language.toLowerCase();
  const target = (req.body?.targetLanguage || 'javascript').toLowerCase();

  if (source === target) {
    return res.status(400).json({ message: 'Source and target languages must differ.' });
  }

  const conversionBanner = `// Converted from ${source} to ${target} (heuristic)\n`;
  const convertedCode = `${conversionBanner}${payload.code}`;

  buildResult(res, {
    convertedCode,
    targetLanguage: target,
  });
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