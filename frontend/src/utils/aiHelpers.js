import axios from 'axios';

const AI_BASE_URL =
  import.meta.env.VITE_AI_BASE_URL || 'http://localhost:5000/api/ai';

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
};

const ensureString = (value, fallback = '') =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const callAiEndpoint = async (endpoint, payload) => {
  try {
    const { data } = await axios.post(`${AI_BASE_URL}/${endpoint}`, payload);
    return data?.result || data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Unable to complete AI request';
    throw new Error(message);
  }
};

export const explainCode = async (code, language) => {
  const data = await callAiEndpoint('explain-code', { code, language });
  return {
    explanation:
      ensureString(data.explanation) ||
      ensureString(data.summary) ||
      'No explanation returned.',
    lines: ensureArray(data.lines || data.breakdown || []),
  };
};

export const optimizeCode = async (code, language) => {
  const data = await callAiEndpoint('optimize-code', { code, language });
  return {
    optimizedCode: ensureString(data.optimizedCode || data.code || ''),
    explanation:
      ensureString(data.explanation) ||
      ensureString(data.notes) ||
      'Optimization notes not provided.',
  };
};

export const detectBugs = async (code, language) => {
  const data = await callAiEndpoint('find-bugs', { code, language });
  return {
    bugs: ensureArray(data.bugs || data.issues || []),
    summary:
      ensureString(data.summary) ||
      ensureString(data.explanation) ||
      'Potential issue list generated.',
  };
};

export const generateTestcases = async (code, language) => {
  const data = await callAiEndpoint('generate-testcases', { code, language });
  const testcases = ensureArray(data.testcases || data.cases || []).map(
    (testcase, index) => ({
      id: testcase.id || `case-${index + 1}`,
      title:
        testcase.title ||
        testcase.name ||
        `Testcase ${index + 1}`,
      input: testcase.input || testcase.inputs || '',
      expected: testcase.expected || testcase.output || '',
      description:
        testcase.description ||
        testcase.explanation ||
        'No description provided.',
    })
  );
  return {
    testcases,
  };
};

export const simulateInput = async (code, language, userInput) => {
  const data = await callAiEndpoint('simulate-input', {
    code,
    language,
    input: userInput,
  });

  return {
    steps: ensureArray(data.steps || data.iterations || []),
    variables: data.variables || data.stateChanges || {},
    notes: ensureString(data.notes || data.summary || ''),
  };
};

export const fixCode = async (code, language) => {
  const data = await callAiEndpoint('fix-code', { code, language });
  return {
    fixedCode: ensureString(data.fixedCode || data.code || ''),
    explanation:
      ensureString(data.explanation) ||
      ensureString(data.summary) ||
      'Fix explanation not provided.',
  };
};

export const analyzeComplexity = async (code, language) => {
  const data = await callAiEndpoint('analyze-complexity', { code, language });
  return {
    time: ensureString(data.time || data.timeComplexity || 'Unknown'),
    space: ensureString(data.space || data.spaceComplexity || 'Unknown'),
    reasoning:
      ensureString(data.reasoning) ||
      ensureString(data.explanation) ||
      'No reasoning supplied.',
  };
};

export const generateComments = async (code, language) => {
  const data = await callAiEndpoint('generate-comments', { code, language });
  return {
    commentedCode: ensureString(data.commentedCode || data.code || ''),
    summary:
      ensureString(data.summary) ||
      ensureString(data.description) ||
      'No summary included.',
    docstring: ensureString(data.docstring || ''),
  };
};

export const getRecommendations = async (code, language) => {
  const data = await callAiEndpoint('code-recommendations', { code, language });
  return {
    topics: ensureArray(data.topics || data.focusAreas || []),
    questions: ensureArray(data.questions || data.practice || []),
    mistakes: ensureArray(data.mistakes || data.commonIssues || []),
  };
};

export const convertLanguage = async (
  code,
  sourceLanguage,
  targetLanguage
) => {
  const data = await callAiEndpoint('convert-language', {
    code,
    language: sourceLanguage, // Backend expects 'language' for source
    targetLanguage: targetLanguage,
  });
  return {
    convertedCode: ensureString(data.convertedCode || data.code || ''),
    targetLanguage:
      data.targetLanguage || data.language || targetLanguage,
  };
};

