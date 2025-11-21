import React, { useState } from 'react';
import {
  Loader2,
  Info,
  Sparkles,
  Bug,
  ListChecks,
  PlayCircle,
  Wrench,
  Gauge,
  PenLine,
  Lightbulb,
  Languages,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  analyzeComplexity,
  convertLanguage,
  detectBugs,
  explainCode,
  fixCode,
  generateComments,
  generateTestcases,
  getRecommendations as fetchRecommendations,
  optimizeCode,
  simulateInput,
} from '@/utils/aiHelpers';

// Alias to avoid duplicate import name
const recommendationEngine = fetchRecommendations;

const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
];

const ResultCard = ({ title, description, children }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      {description && (
        <CardDescription className="text-sm text-gray-500">
          {description}
        </CardDescription>
      )}
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

const CodeBlock = ({ label, value }) => (
  <div className="space-y-2">
    {label && (
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
    )}
    <pre className="w-full overflow-auto rounded-md bg-slate-900 p-4 text-sm text-slate-100">
      {value || 'No output returned.'}
    </pre>
  </div>
);

const initialResults = {
  explanation: null,
  optimization: null,
  bugs: null,
  testcases: null,
  simulation: null,
  fix: null,
  complexity: null,
  comments: null,
  recommendations: null,
  conversion: null,
};

const actionConfigs = [
  { key: 'explanation', label: 'Explain Code', icon: Info },
  { key: 'optimization', label: 'Optimize Code', icon: Sparkles },
  { key: 'bugs', label: 'Find Bugs', icon: Bug },
  { key: 'testcases', label: 'Generate Testcases', icon: ListChecks },
  { key: 'simulation', label: 'Simulate Input', icon: PlayCircle },
  { key: 'fix', label: 'Fix My Code', icon: Wrench },
  { key: 'complexity', label: 'Analyze Complexity', icon: Gauge },
  { key: 'comments', label: 'Generate Comments', icon: PenLine },
  { key: 'recommendations', label: 'AI Recommendations', icon: Lightbulb },
  { key: 'conversion', label: 'Convert Language', icon: Languages },
];

const CodeView = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [simulationInput, setSimulationInput] = useState('');
  const [results, setResults] = useState(initialResults);
  const [loadingAction, setLoadingAction] = useState(null);
  const [modalState, setModalState] = useState({
    open: false,
    title: '',
    description: '',
    content: null,
  });

  const hasCode = code.trim().length > 0;

  const setModalContent = (title, description, content) => {
    setModalState({
      open: true,
      title,
      description,
      content,
    });
  };

  const closeModal = () =>
    setModalState((prev) => ({
      ...prev,
      open: false,
    }));

  const runAction = async ({
    key,
    request,
    args = [],
    successMessage,
    modalTitle,
    modalDescription,
  }) => {
    if (!hasCode) {
      toast.error('Please paste your code before using AI features.');
      return;
    }
    setLoadingAction(key);
    try {
      const data = await request(...args);
      setResults((prev) => ({
        ...prev,
        [key]: data,
      }));
      setModalContent(
        modalTitle,
        modalDescription,
        renderResultContent(key, data)
      );
      toast.success(successMessage);
    } catch (error) {
      toast.error(error.message || 'AI action failed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const renderList = (items = []) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="text-sm text-gray-500">No data available.</p>;
    }
    return (
      <ul className="list-disc space-y-2 pl-5 text-sm">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="text-gray-700">
            {typeof item === 'string' ? item : item.description || JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  };

  const renderResultContent = (key, data) => {
    switch (key) {
      case 'explanation':
        return (
          <div className="space-y-4">
            {data.lines?.length ? (
              <div className="space-y-2 text-sm text-gray-700">
                {data.lines.map((line, idx) => (
                  <p key={idx}>
                    <span className="font-semibold">Line {idx + 1}:</span> {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {data.explanation}
              </p>
            )}
          </div>
        );
      case 'optimization':
        return (
          <div className="space-y-4">
            <CodeBlock label="Optimized Code" value={data.optimizedCode} />
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {data.explanation}
            </p>
          </div>
        );
      case 'bugs':
        {
          const bugItems = (data.bugs || []).map((bug, idx) =>
            typeof bug === 'string'
              ? bug
              : `${bug.title || `Issue ${idx + 1}`}: ${
                  bug.detail || bug.description || JSON.stringify(bug)
                }`
          );
        return (
          <div className="space-y-3">
            {renderList(bugItems)}
            {data.summary && (
              <p className="text-sm text-gray-600">{data.summary}</p>
            )}
          </div>
        );
        }
      case 'testcases':
        return (
          <div className="space-y-4">
            {(data.testcases || []).map((testcase) => (
              <div
                key={testcase.id}
                className="rounded-md border border-gray-200 p-3 text-sm"
              >
                <p className="font-semibold text-gray-900">{testcase.title}</p>
                <p className="text-gray-600">{testcase.description}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Input</p>
                    <pre className="rounded bg-gray-100 p-2">
                      {testcase.input || 'N/A'}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Expected
                    </p>
                    <pre className="rounded bg-gray-100 p-2">
                      {testcase.expected || 'N/A'}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'simulation':
        return (
          <div className="space-y-4">
            {data.steps?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Execution Steps
                </p>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
                  {data.steps.map((step, idx) => (
                    <li key={`step-${idx}`}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            {data.variables && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Variable Timeline
                </p>
                <pre className="rounded-md bg-gray-100 p-3 text-sm text-gray-800">
                  {JSON.stringify(data.variables, null, 2)}
                </pre>
              </div>
            )}
            {data.notes && (
              <p className="text-sm text-gray-600">{data.notes}</p>
            )}
          </div>
        );
      case 'fix':
        return (
          <div className="space-y-4">
            <CodeBlock label="Fixed Code" value={data.fixedCode} />
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {data.explanation}
            </p>
          </div>
        );
      case 'complexity':
        return (
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Time Complexity:</span> {data.time}
            </p>
            <p>
              <span className="font-semibold">Space Complexity:</span>{' '}
              {data.space}
            </p>
            <p className="whitespace-pre-wrap">{data.reasoning}</p>
          </div>
        );
      case 'comments':
        return (
          <div className="space-y-4">
            {data.summary && (
              <p className="text-sm text-gray-600">{data.summary}</p>
            )}
            {data.docstring && (
              <CodeBlock label="Docstring" value={data.docstring} />
            )}
            <CodeBlock label="Commented Code" value={data.commentedCode} />
          </div>
        );
      case 'recommendations':
        return (
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">
                Focus Topics
              </p>
              {renderList(data.topics)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Suggested Practice Questions
              </p>
              {renderList(data.questions)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Common Mistakes
              </p>
              {renderList(data.mistakes)}
            </div>
          </div>
        );
      case 'conversion':
        return (
          <div className="space-y-4">
            <CodeBlock
              label={`Converted Code (${data.targetLanguage?.toUpperCase()})`}
              value={data.convertedCode}
            />
          </div>
        );
      default:
        return (
          <p className="text-sm text-gray-500">
            No renderer configured for this result.
          </p>
        );
    }
  };

  const handleExplain = () =>
    runAction({
      key: 'explanation',
      request: explainCode,
      args: [code, language],
      successMessage: 'Generated AI explanation',
      modalTitle: 'AI Code Explanation',
      modalDescription: 'Line-by-line or block-level insights',
    });

  const handleOptimize = () =>
    runAction({
      key: 'optimization',
      request: optimizeCode,
      args: [code, language],
      successMessage: 'Optimization ready',
      modalTitle: 'AI Code Optimization',
      modalDescription: 'Refactored code and reasoning',
    });

  const handleBugs = () =>
    runAction({
      key: 'bugs',
      request: detectBugs,
      args: [code, language],
      successMessage: 'Bug scan completed',
      modalTitle: 'AI Bug Detection',
      modalDescription: 'Potential issues & anti-patterns',
    });

  const handleTestcases = () =>
    runAction({
      key: 'testcases',
      request: generateTestcases,
      args: [code, language],
      successMessage: 'Testcases generated',
      modalTitle: 'AI Testcase Generator',
      modalDescription: 'Edge, stress, and happy-path tests',
    });

  const handleSimulation = () => {
    if (!simulationInput.trim()) {
      toast.error('Provide input payload for the simulator.');
      return;
    }
    return runAction({
      key: 'simulation',
      request: simulateInput,
      args: [code, language, simulationInput],
      successMessage: 'Simulation completed',
      modalTitle: 'AI Input Simulator',
      modalDescription: 'Step-by-step execution trace',
    });
  };

  const handleFix = () =>
    runAction({
      key: 'fix',
      request: fixCode,
      args: [code, language],
      successMessage: 'Code fixed successfully',
      modalTitle: 'AI Fix My Code',
      modalDescription: 'Patched code & explanations',
    });

  const handleComplexity = () =>
    runAction({
      key: 'complexity',
      request: analyzeComplexity,
      args: [code, language],
      successMessage: 'Complexity analyzed',
      modalTitle: 'AI Complexity Analyzer',
      modalDescription: 'Time & space reasoning',
    });

  const handleComments = () =>
    runAction({
      key: 'comments',
      request: generateComments,
      args: [code, language],
      successMessage: 'Comments generated',
      modalTitle: 'AI Comment Generator',
      modalDescription: 'Docstrings & inline context',
    });

  const handleRecommendations = () =>
    runAction({
      key: 'recommendations',
      request: recommendationEngine,
      args: [code, language],
      successMessage: 'Personalized recommendations ready',
      modalTitle: 'AI Recommendation Engine',
      modalDescription: 'Topics, questions, and pitfalls',
    });

  const handleConversion = () => {
    if (language === targetLanguage) {
      toast.info('Select a different target language.');
      return;
    }
    return runAction({
      key: 'conversion',
      request: convertLanguage,
      args: [code, language, targetLanguage],
      successMessage: 'Language conversion complete',
      modalTitle: 'AI Language Converter',
      modalDescription: `Converted to ${targetLanguage.toUpperCase()}`,
    });
  };

  const actionHandlers = {
    explanation: handleExplain,
    optimization: handleOptimize,
    bugs: handleBugs,
    testcases: handleTestcases,
    simulation: handleSimulation,
    fix: handleFix,
    complexity: handleComplexity,
    comments: handleComments,
    recommendations: handleRecommendations,
    conversion: handleConversion,
  };

  const renderResultPanels = () =>
    actionConfigs
      .filter((config) => results[config.key])
      .map((config) => (
        <ResultCard
          key={config.key}
          title={config.label}
          description="AI generated output"
        >
          {renderResultContent(config.key, results[config.key])}
        </ResultCard>
      ));

  const renderedPanels = renderResultPanels();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            AI-Powered Code Mentor
          </h1>
          <p className="mt-1 text-gray-600">
            Understand, debug, and elevate your code with one-click AI insights.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Code Workspace</CardTitle>
            <CardDescription>Paste or write your code snippet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700">
                  Source Language
                </label>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700">
                  Target Language (Converter)
                </label>
                <select
                  value={targetLanguage}
                  onChange={(event) => setTargetLanguage(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              rows={16}
              placeholder="Paste your solution here..."
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inputs & Simulation</CardTitle>
            <CardDescription>
              Provide custom input for the AI input simulator to trace execution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Simulator Input
            </label>
            <Textarea
              value={simulationInput}
              onChange={(event) => setSimulationInput(event.target.value)}
              rows={4}
              placeholder='Example: {"nums":[1,2,3],"target":6}'
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Toolbelt</CardTitle>
            <CardDescription>
              Run specialized AI copilots for explanation, debugging, optimization, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {actionConfigs.map((action) => {
                const Icon = action.icon;
                const isLoading = loadingAction === action.key;
                return (
                  <Button
                    key={action.key}
                    variant="secondary"
                    className="flex w-full items-center justify-center gap-2 border border-gray-200 bg-white text-gray-900 shadow-sm hover:border-gray-300 hover:bg-gray-50"
                    disabled={isLoading}
                    onClick={actionHandlers[action.key]}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="text-sm font-semibold">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {renderedPanels.length > 0 ? (
            renderedPanels
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                Results will appear here once you run an AI action.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={modalState.open} onOpenChange={closeModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalState.title}</DialogTitle>
            {modalState.description && (
              <DialogDescription>{modalState.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">{modalState.content}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeView;

