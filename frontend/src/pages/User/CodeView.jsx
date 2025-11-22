import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Info, Sparkles, Bug, ListChecks, PlayCircle, Wrench, Gauge, PenLine, Lightbulb, Languages, X } from 'lucide-react';
import {
  explainCode,
  optimizeCode,
  detectBugs,
  generateTestcases,
  simulateInput,
  fixCode,
  analyzeComplexity,
  generateComments,
  getRecommendations,
  convertLanguage
} from '../../utils/aiHelpers';

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

const Toast = ({ message, type = 'success', onClose }) => {
  const bgColor = type === 'error' ? 'bg-red-500' : type === 'info' ? 'bg-blue-500' : 'bg-green-500';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2 min-w-[300px] max-w-[500px]`}
    >
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-80">
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
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
    setTimeout(() => setToast(null), 5000);
  };

  const hasCode = code.trim().length > 0;

  /**
   * Shared function for calling AI API endpoints
   * Handles validation, loading states, errors, and results
   */
  const runAction = async ({ 
    key, 
    request, 
    args = [], 
    successMessage, 
    modalTitle, 
    modalDescription,
    validateInput = null,
    updateEditor = false
  }) => {
    // Validate code exists
    if (!hasCode) {
      showToast('Please enter code first.', 'error');
      return;
    }

    // Run custom validation if provided
    if (validateInput) {
      const validationResult = validateInput();
      if (!validationResult.valid) {
        showToast(validationResult.message, 'error');
        return;
      }
    }

    setLoadingAction(key);
    try {
      const data = await request(...args);
      
      // Update editor if needed (for optimize code)
      if (updateEditor && data.optimizedCode) {
        setCode(data.optimizedCode);
      }

      setResults(prev => ({ ...prev, [key]: data }));
      setModalState({
        open: true,
        title: modalTitle,
        description: modalDescription,
        content: renderResultContent(key, data)
      });
      showToast(successMessage);
    } catch (error) {
      // Enhanced error handling
      let errorMessage = 'AI action failed. Please try again.';
      
      if (error.response) {
        // Network error with response
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        // Network error without response
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        // Error with message
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
      console.error('AI action error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const renderResultContent = (key, data) => {
    switch (key) {
      case 'explanation':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {data.explanation || 'No explanation available.'}
            </div>
            {data.lines && Array.isArray(data.lines) && data.lines.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">LINE-BY-LINE BREAKDOWN</p>
                <div className="space-y-1 text-xs">
                  {data.lines.map((line, idx) => (
                    <div key={idx} className="font-mono text-gray-600 dark:text-gray-400">
                      {typeof line === 'string' ? line : `Line ${line.number}: ${line.content}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'optimization':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">OPTIMIZED CODE</p>
              <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-md overflow-auto text-sm font-mono">
                {data.optimizedCode || 'No optimized code returned.'}
              </pre>
            </div>
            {data.explanation && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">OPTIMIZATION NOTES</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.explanation}</p>
              </div>
            )}
          </div>
        );
      
      case 'bugs':
        const bugsList = Array.isArray(data.bugs) ? data.bugs : [];
        return (
          <div className="space-y-3">
            {bugsList.length > 0 ? (
              <>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {bugsList.map((bug, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">
                      {typeof bug === 'string' ? (
                        <span>{bug}</span>
                      ) : (
                        <>
                          <span className="font-semibold">{bug.title || `Issue ${idx + 1}`}:</span> {bug.description || bug}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                {data.summary && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{data.summary}</p>}
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No bugs detected.</p>
            )}
          </div>
        );
      
      case 'testcases':
        const testcasesList = Array.isArray(data.testcases) ? data.testcases : [];
        return (
          <div className="space-y-4">
            {testcasesList.length > 0 ? (
              testcasesList.map((tc, idx) => (
                <div key={tc.id || idx} className="border border-gray-200 dark:border-neutral-700 rounded-md p-3 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">{tc.title || `Test Case ${idx + 1}`}</p>
                  {tc.description && <p className="text-gray-600 dark:text-gray-400 mt-1">{tc.description}</p>}
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Input</p>
                      <pre className="bg-gray-100 dark:bg-neutral-800 rounded p-2 text-xs overflow-auto">{tc.input || 'N/A'}</pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Expected</p>
                      <pre className="bg-gray-100 dark:bg-neutral-800 rounded p-2 text-xs overflow-auto">{tc.expected || 'N/A'}</pre>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No test cases generated.</p>
            )}
          </div>
        );
      
      case 'simulation':
        const stepsList = Array.isArray(data.steps) ? data.steps : [];
        return (
          <div className="space-y-4">
            {stepsList.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">EXECUTION STEPS</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {stepsList.map((step, idx) => (
                    <li key={idx}>{typeof step === 'string' ? step : JSON.stringify(step)}</li>
                  ))}
                </ol>
              </div>
            )}
            {data.variables && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">VARIABLE TIMELINE</p>
                <pre className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-md text-sm overflow-auto">
                  {JSON.stringify(data.variables, null, 2)}
                </pre>
              </div>
            )}
            {data.notes && <p className="text-sm text-gray-600 dark:text-gray-400">{data.notes}</p>}
          </div>
        );
      
      case 'fix':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">FIXED CODE</p>
              <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-md overflow-auto text-sm font-mono">
                {data.fixedCode || 'No fixed code returned.'}
              </pre>
            </div>
            {data.explanation && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">FIX EXPLANATION</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.explanation}</p>
              </div>
            )}
          </div>
        );
      
      case 'complexity':
        return (
          <div className="space-y-3 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="border border-gray-200 dark:border-neutral-700 rounded-md p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Time Complexity</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{data.time || 'Unknown'}</p>
              </div>
              <div className="border border-gray-200 dark:border-neutral-700 rounded-md p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Space Complexity</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{data.space || 'Unknown'}</p>
              </div>
            </div>
            {data.reasoning && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">ANALYSIS</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.reasoning}</p>
              </div>
            )}
          </div>
        );
      
      case 'comments':
        return (
          <div className="space-y-4">
            {data.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{data.summary}</p>
            )}
            {data.docstring && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">DOCSTRING</p>
                <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-md overflow-auto text-sm font-mono">
                  {data.docstring}
                </pre>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">COMMENTED CODE</p>
              <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-md overflow-auto text-sm font-mono">
                {data.commentedCode || 'No commented code returned.'}
              </pre>
            </div>
          </div>
        );
      
      case 'recommendations':
        const topicsList = Array.isArray(data.topics) ? data.topics : [];
        const questionsList = Array.isArray(data.questions) ? data.questions : [];
        const mistakesList = Array.isArray(data.mistakes) ? data.mistakes : [];
        return (
          <div className="space-y-4 text-sm">
            {topicsList.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Focus Topics</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  {topicsList.map((topic, idx) => <li key={idx}>{topic}</li>)}
                </ul>
              </div>
            )}
            {questionsList.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Suggested Practice Questions</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  {questionsList.map((q, idx) => <li key={idx}>{q}</li>)}
                </ul>
              </div>
            )}
            {mistakesList.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Common Mistakes</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  {mistakesList.map((m, idx) => <li key={idx}>{m}</li>)}
                </ul>
              </div>
            )}
            {topicsList.length === 0 && questionsList.length === 0 && mistakesList.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400">No recommendations available.</p>
            )}
          </div>
        );
      
      case 'conversion':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                CONVERTED CODE ({data.targetLanguage?.toUpperCase() || 'UNKNOWN'})
              </p>
              <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-md overflow-auto text-sm font-mono">
                {data.convertedCode || 'No converted code returned.'}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (data.convertedCode) {
                    setCode(data.convertedCode);
                    setLanguage(data.targetLanguage || targetLanguage);
                    showToast('Converted code loaded into editor', 'success');
                  }
                }}
                variant="secondary"
                className="text-sm"
              >
                Use This Code
              </Button>
            </div>
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
      successMessage: 'Code optimized and updated in editor',
      modalTitle: 'AI Code Optimization',
      modalDescription: 'Refactored code and reasoning',
      updateEditor: true
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
      // Validate simulation input
      if (!simulationInput.trim()) {
        showToast('Please provide input for simulation (JSON format recommended).', 'error');
        return;
      }

      // Validate JSON if it looks like JSON
      if (simulationInput.trim().startsWith('{') || simulationInput.trim().startsWith('[')) {
        try {
          JSON.parse(simulationInput);
        } catch (e) {
          showToast('Invalid JSON format. Please provide valid JSON input.', 'error');
          return;
        }
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
      // Validate target language
      if (!targetLanguage || targetLanguage.trim().length === 0) {
        showToast('Select a target language.', 'error');
        return;
      }

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
          <div className="space-y-4 mt-4">{modalState.content}</div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setModalState(prev => ({ ...prev, open: false }))} variant="secondary">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CodeView;