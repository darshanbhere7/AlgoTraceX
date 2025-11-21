import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Info, Sparkles, Bug, ListChecks, PlayCircle, Wrench, Gauge, PenLine, Lightbulb, Languages } from 'lucide-react';

// Mock AI helper functions (replace with actual API calls)
const explainCode = async (code, language) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    explanation: `This ${language} code performs the following operations:\n\n1. Declares variables and initializes data structures\n2. Implements core logic with conditional statements\n3. Returns the final result\n\nThe algorithm follows standard patterns for this type of problem.`
  };
};

const optimizeCode = async (code, language) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    optimizedCode: `// Optimized version\n${code}\n// Performance improvements applied`,
    explanation: 'Optimizations applied:\n- Reduced time complexity\n- Improved memory usage\n- Removed redundant operations'
  };
};

const detectBugs = async (code, language) => {
  await new Promise(resolve => setTimeout(resolve, 1800));
  return {
    bugs: [
      { title: 'Potential Null Pointer', description: 'Variable may be null at line 15' },
      { title: 'Off-by-one Error', description: 'Loop boundary condition may cause issues' }
    ],
    summary: 'Found 2 potential issues that should be reviewed.'
  };
};

const generateTestcases = async (code, language) => {
  await new Promise(resolve => setTimeout(resolve, 1600));
  return {
    testcases: [
      { id: 1, title: 'Happy Path', description: 'Normal input case', input: '[1,2,3]', expected: '6' },
      { id: 2, title: 'Edge Case', description: 'Empty input', input: '[]', expected: '0' },
      { id: 3, title: 'Stress Test', description: 'Large input', input: '[1...1000]', expected: '500500' }
    ]
  };
};

const simulateInput = async (code, language, input) => {
  await new Promise(resolve => setTimeout(resolve, 2200));
  return {
    steps: [
      'Initialize variables',
      `Process input: ${input}`,
      'Execute main logic',
      'Return result'
    ],
    variables: { step1: 'value1', step2: 'value2' },
    notes: 'Simulation completed successfully'
  };
};

const fixCode = async (code, language) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    fixedCode: `// Fixed version\n${code}\n// Bugs corrected`,
    explanation: 'Applied fixes:\n- Corrected null checks\n- Fixed loop boundaries\n- Added error handling'
  };
};

const analyzeComplexity = async (code, language) => {
  await new Promise(resolve => setTimeout(resolve, 1400));
  return {
    time: 'O(n)',
    space: 'O(1)',
    reasoning: 'The algorithm iterates through the input once with constant extra space.'
  };
};

const generateComments = async (code, language) => {
  await new Promise(resolve => setTimeout(resolve, 1700));
  return {
    commentedCode: `/**\n * Function description\n */\n${code}\n// Inline comments added`,
    docstring: '/**\n * @param {type} param - description\n * @returns {type} description\n */',
    summary: 'Added comprehensive documentation'
  };
};

const getRecommendations = async (code, language) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    topics: ['Data Structures', 'Algorithms', 'Design Patterns'],
    questions: ['Practice array manipulation', 'Study sorting algorithms', 'Learn recursion'],
    mistakes: ['Not handling edge cases', 'Inefficient loops', 'Poor variable naming']
  };
};

const convertLanguage = async (code, sourceLanguage, targetLanguage) => {
  await new Promise(resolve => setTimeout(resolve, 2500));
  return {
    convertedCode: `# Converted to ${targetLanguage}\n# Original ${sourceLanguage} code converted\n\n${code.split('\n').map(line => '# ' + line).join('\n')}`,
    targetLanguage: targetLanguage
  };
};

const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
];

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-6 pb-4">{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }) => <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`}>{children}</p>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Button = ({ children, onClick, disabled, className = '', variant = 'default' }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = variant === 'secondary' 
    ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700' 
    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 border border-gray-900 dark:border-white';
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </button>
  );
};

const Textarea = ({ value, onChange, rows, placeholder, className = '' }) => (
  <textarea
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white ${className}`}
  />
);

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto border border-gray-200 dark:border-neutral-800">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = '' }) => <div className={`p-6 ${className}`}>{children}</div>;
const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-gray-600 dark:text-gray-400 mt-1">{children}</p>;

const Toast = ({ message, type = 'success' }) => {
  const bgColor = type === 'error' ? 'bg-red-500' : type === 'info' ? 'bg-blue-500' : 'bg-green-500';
  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg z-50`}>
      {message}
    </div>
  );
};

const CodeView = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [simulationInput, setSimulationInput] = useState('');
  const [results, setResults] = useState({});
  const [loadingAction, setLoadingAction] = useState(null);
  const [modalState, setModalState] = useState({ open: false, title: '', description: '', content: null });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hasCode = code.trim().length > 0;

  const runAction = async ({ key, request, args = [], successMessage, modalTitle, modalDescription }) => {
    if (!hasCode) {
      showToast('Please paste your code before using AI features.', 'error');
      return;
    }
    setLoadingAction(key);
    try {
      const data = await request(...args);
      setResults(prev => ({ ...prev, [key]: data }));
      setModalState({
        open: true,
        title: modalTitle,
        description: modalDescription,
        content: renderResultContent(key, data)
      });
      showToast(successMessage);
    } catch (error) {
      showToast(error.message || 'AI action failed. Please try again.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const renderResultContent = (key, data) => {
    switch (key) {
      case 'explanation':
        return <div className="text-sm text-gray-700 whitespace-pre-wrap">{data.explanation}</div>;
      
      case 'optimization':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">OPTIMIZED CODE</p>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-md overflow-auto text-sm">{data.optimizedCode}</pre>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.explanation}</p>
          </div>
        );
      
      case 'bugs':
        return (
          <div className="space-y-3">
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {data.bugs.map((bug, idx) => (
                <li key={idx} className="text-gray-700">
                  <span className="font-semibold">{bug.title}:</span> {bug.description}
                </li>
              ))}
            </ul>
            {data.summary && <p className="text-sm text-gray-600">{data.summary}</p>}
          </div>
        );
      
      case 'testcases':
        return (
          <div className="space-y-4">
            {data.testcases.map(tc => (
              <div key={tc.id} className="border border-gray-200 rounded-md p-3 text-sm">
                <p className="font-semibold text-gray-900">{tc.title}</p>
                <p className="text-gray-600">{tc.description}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Input</p>
                    <pre className="bg-gray-100 rounded p-2">{tc.input}</pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Expected</p>
                    <pre className="bg-gray-100 rounded p-2">{tc.expected}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'simulation':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">EXECUTION STEPS</p>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                {data.steps.map((step, idx) => <li key={idx}>{step}</li>)}
              </ol>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">VARIABLE TIMELINE</p>
              <pre className="bg-gray-100 p-3 rounded-md text-sm">{JSON.stringify(data.variables, null, 2)}</pre>
            </div>
            {data.notes && <p className="text-sm text-gray-600">{data.notes}</p>}
          </div>
        );
      
      case 'fix':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">FIXED CODE</p>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-md overflow-auto text-sm">{data.fixedCode}</pre>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.explanation}</p>
          </div>
        );
      
      case 'complexity':
        return (
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-semibold">Time Complexity:</span> {data.time}</p>
            <p><span className="font-semibold">Space Complexity:</span> {data.space}</p>
            <p className="whitespace-pre-wrap">{data.reasoning}</p>
          </div>
        );
      
      case 'comments':
        return (
          <div className="space-y-4">
            {data.summary && <p className="text-sm text-gray-600">{data.summary}</p>}
            {data.docstring && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">DOCSTRING</p>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-md overflow-auto text-sm">{data.docstring}</pre>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">COMMENTED CODE</p>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-md overflow-auto text-sm">{data.commentedCode}</pre>
            </div>
          </div>
        );
      
      case 'recommendations':
        return (
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Focus Topics</p>
              <ul className="list-disc pl-5 space-y-1">
                {data.topics.map((topic, idx) => <li key={idx}>{topic}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Suggested Practice Questions</p>
              <ul className="list-disc pl-5 space-y-1">
                {data.questions.map((q, idx) => <li key={idx}>{q}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Common Mistakes</p>
              <ul className="list-disc pl-5 space-y-1">
                {data.mistakes.map((m, idx) => <li key={idx}>{m}</li>)}
              </ul>
            </div>
          </div>
        );
      
      case 'conversion':
        return (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">CONVERTED CODE ({data.targetLanguage.toUpperCase()})</p>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-md overflow-auto text-sm">{data.convertedCode}</pre>
          </div>
        );
      
      default:
        return <p className="text-sm text-gray-500">No renderer configured for this result.</p>;
    }
  };

  const handlers = {
    explain: () => runAction({
      key: 'explanation',
      request: explainCode,
      args: [code, language],
      successMessage: 'Generated AI explanation',
      modalTitle: 'AI Code Explanation',
      modalDescription: 'Line-by-line or block-level insights'
    }),
    optimize: () => runAction({
      key: 'optimization',
      request: optimizeCode,
      args: [code, language],
      successMessage: 'Optimization ready',
      modalTitle: 'AI Code Optimization',
      modalDescription: 'Refactored code and reasoning'
    }),
    bugs: () => runAction({
      key: 'bugs',
      request: detectBugs,
      args: [code, language],
      successMessage: 'Bug scan completed',
      modalTitle: 'AI Bug Detection',
      modalDescription: 'Potential issues & anti-patterns'
    }),
    testcases: () => runAction({
      key: 'testcases',
      request: generateTestcases,
      args: [code, language],
      successMessage: 'Testcases generated',
      modalTitle: 'AI Testcase Generator',
      modalDescription: 'Edge, stress, and happy-path tests'
    }),
    simulation: () => {
      if (!simulationInput.trim()) {
        showToast('Provide input payload for the simulator.', 'error');
        return;
      }
      runAction({
        key: 'simulation',
        request: simulateInput,
        args: [code, language, simulationInput],
        successMessage: 'Simulation completed',
        modalTitle: 'AI Input Simulator',
        modalDescription: 'Step-by-step execution trace'
      });
    },
    fix: () => runAction({
      key: 'fix',
      request: fixCode,
      args: [code, language],
      successMessage: 'Code fixed successfully',
      modalTitle: 'AI Fix My Code',
      modalDescription: 'Patched code & explanations'
    }),
    complexity: () => runAction({
      key: 'complexity',
      request: analyzeComplexity,
      args: [code, language],
      successMessage: 'Complexity analyzed',
      modalTitle: 'AI Complexity Analyzer',
      modalDescription: 'Time & space reasoning'
    }),
    comments: () => runAction({
      key: 'comments',
      request: generateComments,
      args: [code, language],
      successMessage: 'Comments generated',
      modalTitle: 'AI Comment Generator',
      modalDescription: 'Docstrings & inline context'
    }),
    recommendations: () => runAction({
      key: 'recommendations',
      request: getRecommendations,
      args: [code, language],
      successMessage: 'Personalized recommendations ready',
      modalTitle: 'AI Recommendation Engine',
      modalDescription: 'Topics, questions, and pitfalls'
    }),
    conversion: () => {
      if (language === targetLanguage) {
        showToast('Select a different target language.', 'info');
        return;
      }
      runAction({
        key: 'conversion',
        request: convertLanguage,
        args: [code, language, targetLanguage],
        successMessage: 'Language conversion complete',
        modalTitle: 'AI Language Converter',
        modalDescription: `Converted to ${targetLanguage.toUpperCase()}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="p-6 pt-24 pb-12 max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI-Powered Code Mentor</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Understand, debug, and elevate your code with one-click AI insights.</p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Code Workspace</CardTitle>
            <CardDescription>Paste or write your code snippet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700">Source Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm shadow-sm focus:border-gray-900 dark:focus:border-white focus:outline-none text-gray-900 dark:text-white"
                >
                  {LANGUAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700">Target Language (for Conversion)</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm shadow-sm focus:border-gray-900 dark:focus:border-white focus:outline-none text-gray-900 dark:text-white"
                >
                  {LANGUAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={16}
              placeholder="Paste your Java, Python, or other code here..."
              className="font-mono text-sm"
            />
            
            <div className="border-t border-gray-200 pt-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">Quick Actions</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button onClick={handlers.conversion} disabled={loadingAction === 'conversion'} className="flex items-center justify-center gap-2">
                  {loadingAction === 'conversion' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                  <span className="text-sm font-semibold">Convert Code</span>
                </Button>
                
                <Button onClick={handlers.optimize} disabled={loadingAction === 'optimization'} className="flex items-center justify-center gap-2">
                  {loadingAction === 'optimization' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span className="text-sm font-semibold">Optimize Code</span>
                </Button>
                
                <Button onClick={handlers.fix} disabled={loadingAction === 'fix'} className="flex items-center justify-center gap-2">
                  {loadingAction === 'fix' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
                  <span className="text-sm font-semibold">Fix My Code</span>
                </Button>
                
                <Button onClick={handlers.explain} disabled={loadingAction === 'explanation'} className="flex items-center justify-center gap-2">
                  {loadingAction === 'explanation' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Info className="h-4 w-4" />}
                  <span className="text-sm font-semibold">Explain Code</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>More AI Tools</CardTitle>
            <CardDescription>Additional analysis and generation tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button onClick={handlers.bugs} disabled={loadingAction === 'bugs'} variant="secondary" className="flex items-center justify-center gap-2">
                {loadingAction === 'bugs' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4 text-red-500" />}
                <span className="text-sm font-semibold">Find Bugs</span>
              </Button>
              
              <Button onClick={handlers.testcases} disabled={loadingAction === 'testcases'} variant="secondary" className="flex items-center justify-center gap-2">
                {loadingAction === 'testcases' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4 text-blue-500" />}
                <span className="text-sm font-semibold">Generate Tests</span>
              </Button>
              
              <Button onClick={handlers.complexity} disabled={loadingAction === 'complexity'} variant="secondary" className="flex items-center justify-center gap-2">
                {loadingAction === 'complexity' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4 text-orange-500" />}
                <span className="text-sm font-semibold">Analyze Complexity</span>
              </Button>
              
              <Button onClick={handlers.comments} disabled={loadingAction === 'comments'} variant="secondary" className="flex items-center justify-center gap-2">
                {loadingAction === 'comments' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4 text-green-500" />}
                <span className="text-sm font-semibold">Add Comments</span>
              </Button>
              
              <Button onClick={handlers.recommendations} disabled={loadingAction === 'recommendations'} variant="secondary" className="flex items-center justify-center gap-2">
                {loadingAction === 'recommendations' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4 text-yellow-500" />}
                <span className="text-sm font-semibold">Get Tips</span>
              </Button>
              
              <Button onClick={handlers.simulation} disabled={loadingAction === 'simulation'} variant="secondary" className="flex items-center justify-center gap-2">
                {loadingAction === 'simulation' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4 text-purple-500" />}
                <span className="text-sm font-semibold">Simulate Input</span>
              </Button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="text-sm font-semibold text-gray-700">Simulator Input (for Simulate button)</label>
              <Textarea
                value={simulationInput}
                onChange={(e) => setSimulationInput(e.target.value)}
                rows={3}
                placeholder='Example: {"nums":[1,2,3],"target":6}'
                className="font-mono text-sm mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalState.open} onOpenChange={() => setModalState(prev => ({ ...prev, open: false }))}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalState.title}</DialogTitle>
            <DialogDescription>{modalState.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">{modalState.content}</div>
        </DialogContent>
      </Dialog>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default CodeView;