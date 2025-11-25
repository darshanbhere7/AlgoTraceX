import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  ChevronRight,
  Layers,
  Repeat,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/Progress';

const STORAGE_KEYS = {
  activeState: 'weeklyTest.activeState',
  analytics: 'weeklyTest.analytics',
  badges: 'weeklyTest.badges',
  streak: 'weeklyTest.streak',
  offline: 'weeklyTest.offlineSubmissions',
  practiceReveal: 'weeklyTest.practiceReveal',
};

const AUTO_SAVE_INTERVAL = 5000;
const RETAKE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const CHEAT_LIMIT = 3;

const getJSON = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setJSON = (key, value) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const shuffleArray = (input) => {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const buildRandomizedSession = (test, savedRandomization) => {
  if (!test) return { randomizedQuestions: [], randomizationMeta: null };
  const baseQuestions = test.questions || [];
  let questionOrder =
    savedRandomization?.questionOrder?.length === baseQuestions.length
      ? savedRandomization.questionOrder
      : shuffleArray(baseQuestions.map((_, idx) => idx));

  if (questionOrder.length !== baseQuestions.length) {
    questionOrder = baseQuestions.map((_, idx) => idx);
  }

  const optionOrders = savedRandomization?.optionOrders ? { ...savedRandomization.optionOrders } : {};

  const randomizedQuestions = questionOrder.map((originalIndex) => {
    const referenceQuestion = baseQuestions[originalIndex];
    if (!referenceQuestion) return null;
    const optionIndices = referenceQuestion.options?.map((_, idx) => idx) || [];
    const optionOrder =
      optionOrders[originalIndex] && optionOrders[originalIndex].length === optionIndices.length
        ? optionOrders[originalIndex]
        : shuffleArray(optionIndices);

    optionOrders[originalIndex] = optionOrder;
    const shuffledOptions = optionOrder.map((optIndex) => referenceQuestion.options[optIndex]);

    return {
      ...referenceQuestion,
      originalIndex,
      optionOrder,
      options: shuffledOptions,
    };
  });

  return {
    randomizedQuestions: randomizedQuestions.filter(Boolean),
    randomizationMeta: {
      questionOrder,
      optionOrders,
    },
  };
};

const calculateCustomScore = (answersArray, baseQuestions, testMeta) => {
  if (!baseQuestions?.length) {
    return {
      percentage: 0,
      correct: [],
      wrong: [],
      skipped: baseQuestions?.length || 0,
    };
  }

  const marksPerQuestion = testMeta?.marksPerQuestion ?? 1;
  const negativeMarking = testMeta?.negativeMarking ?? 0;

  let rawScore = 0;
  const correct = [];
  const wrong = [];
  let skipped = 0;

  baseQuestions.forEach((question, idx) => {
    const correctAnswer = question?.correctAnswer;
    const userAnswer = answersArray[idx];

    if (userAnswer === -1 || userAnswer === undefined) {
      skipped += 1;
      return;
    }

    if (correctAnswer !== undefined && userAnswer === correctAnswer) {
      rawScore += marksPerQuestion;
      correct.push(idx);
    } else if (correctAnswer !== undefined) {
      rawScore -= negativeMarking;
      wrong.push(idx);
    }
  });

  const maxScore = baseQuestions.length * marksPerQuestion;
  const percentage = maxScore > 0 ? Math.max((rawScore / maxScore) * 100, 0) : 0;

  return {
    percentage: Number(percentage.toFixed(2)),
    correct,
    wrong,
    skipped,
  };
};

const evaluateBadges = ({ accuracy, timeRatio, zeroMistakes, streak }) => {
  const earned = [];
  if (accuracy > 90) earned.push('accuracy-ace');
  if (timeRatio < 0.5) earned.push('speed-runner');
  if (zeroMistakes) earned.push('flawless');
  if (streak >= 4) earned.push(`streak-${streak}`);
  return earned;
};


const WeeklyTest = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [scores, setScores] = useState(() => {
    const savedScores = localStorage.getItem('testScores');
    return savedScores ? JSON.parse(savedScores) : {};
  });
  const [cheatingWarnings, setCheatingWarnings] = useState(0);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);
  const [randomizationMeta, setRandomizationMeta] = useState(null);
  const [practiceRevealData, setPracticeRevealData] = useState(null);
  const [testAnalytics, setTestAnalytics] = useState(() => getJSON(STORAGE_KEYS.analytics, {}));
  const [testBadges, setTestBadges] = useState(() => getJSON(STORAGE_KEYS.badges, {}));
  const [streakData, setStreakData] = useState(() =>
    getJSON(STORAGE_KEYS.streak, { streak: 0, lastWeekCompleted: null })
  );

  const originalTestRef = useRef(null);
  const questionTimeSpentRef = useRef([]);
  const activeQuestionRef = useRef(0);
  const autoSaveIntervalRef = useRef(null);

  const answeredCount = useMemo(() => {
    if (!selectedTest) return 0;
    return selectedTest.questions.reduce(
      (acc, _, idx) => (answers[idx] !== undefined ? acc + 1 : acc),
      0
    );
  }, [selectedTest, answers]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tests/public', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setTests(response.data);
    } catch (fetchError) {
      console.error('Failed to fetch tests:', fetchError, fetchError.response?.data);
      const errorMessage =
        fetchError.response?.data?.message ||
        fetchError.message ||
        'Failed to load tests. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalScoreSnapshot = useMemo(() => {
    const summary = Object.values(scores || {}).reduce(
      (acc, score) => {
        acc.totalTests += 1;
        acc.totalScore += score.score || 0;
        acc.totalQuestions += score.totalQuestions || 0;
        acc.totalCorrect += score.correctAnswers || 0;
        return acc;
      },
      { totalTests: 0, totalScore: 0, totalQuestions: 0, totalCorrect: 0 }
    );

    return {
      averageScore: summary.totalTests
        ? Math.round(summary.totalScore / summary.totalTests)
        : 0,
      ...summary,
    };
  }, [scores]);

  const restorePersistedState = useCallback(
    (fetchedTests) => {
      const savedState = getJSON(STORAGE_KEYS.activeState, null);
      if (!savedState?.testId) return;
      const matchedTest = fetchedTests.find((test) => test._id === savedState.testId);
      if (!matchedTest) return;

      const { randomizedQuestions, randomizationMeta: savedRandomization } = buildRandomizedSession(
        matchedTest,
        savedState.randomizationMeta
      );
      if (!randomizedQuestions.length) return;

      const initialTimeLeft = savedState.timeLeft ?? matchedTest.timeLimit * 60;
      const elapsed = savedState.savedAt
        ? Math.floor((Date.now() - savedState.savedAt) / 1000)
        : 0;
      const restoredTimeLeft = Math.max(initialTimeLeft - elapsed, 0);
      if (restoredTimeLeft <= 0) {
        localStorage.removeItem(STORAGE_KEYS.activeState);
        return;
      }

      originalTestRef.current = matchedTest;
      questionTimeSpentRef.current =
        savedState.questionTimeSpent?.length === randomizedQuestions.length
          ? savedState.questionTimeSpent
          : new Array(randomizedQuestions.length).fill(0);
      activeQuestionRef.current = savedState.activeQuestionIndex || 0;

      setSelectedTest({ ...matchedTest, questions: randomizedQuestions });
      setRandomizationMeta(savedRandomization);
      setAnswers(savedState.answers || {});
      setTimeLeft(restoredTimeLeft);
      const computedStart = Date.now() - (matchedTest.timeLimit * 60 - restoredTimeLeft) * 1000;
      setStartTime(computedStart);
      setPracticeMode(Boolean(savedState.practiceMode));
      setAutoSubmitted(Boolean(savedState.autoSubmitted));
      setCheatingWarnings(savedState.cheatingWarnings || 0);
      setAutoSubmitTriggered(false);
      setPracticeRevealData(null);
    },
    []
  );

  useEffect(() => {
    if (tests.length) {
      restorePersistedState(tests);
    }
  }, [tests, restorePersistedState]);

  const saveActiveState = useCallback(() => {
    if (!selectedTest) {
      localStorage.removeItem(STORAGE_KEYS.activeState);
      return;
    }

    setJSON(STORAGE_KEYS.activeState, {
      testId: selectedTest._id,
      answers,
      timeLeft,
      startTime,
      practiceMode,
      autoSubmitted,
      randomizationMeta,
      savedAt: Date.now(),
      cheatingWarnings,
      questionTimeSpent: questionTimeSpentRef.current,
      activeQuestionIndex: activeQuestionRef.current,
    });
  }, [
    selectedTest,
    answers,
    timeLeft,
    startTime,
    practiceMode,
    autoSubmitted,
    randomizationMeta,
    cheatingWarnings,
  ]);

  useEffect(() => {
    if (!selectedTest) {
      localStorage.removeItem(STORAGE_KEYS.activeState);
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      return;
    }

    saveActiveState();
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }
    autoSaveIntervalRef.current = setInterval(saveActiveState, AUTO_SAVE_INTERVAL);
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [selectedTest, saveActiveState]);

  useEffect(() => {
    if (selectedTest) {
      saveActiveState();
    }
  }, [answers, practiceMode, timeLeft, cheatingWarnings, randomizationMeta, saveActiveState, selectedTest]);

  const resetWorkingState = () => {
    setSelectedTest(null);
    setAnswers({});
    setTimeLeft(null);
    setStartTime(null);
    setAutoSubmitted(false);
    setPracticeMode(false);
    setCheatingWarnings(0);
    setAutoSubmitTriggered(false);
    setRandomizationMeta(null);
    setPracticeRevealData(null);
    questionTimeSpentRef.current = [];
    activeQuestionRef.current = 0;
    originalTestRef.current = null;
    localStorage.removeItem(STORAGE_KEYS.activeState);
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  };

  const canAttemptTest = useCallback(
    (test, mode = 'standard') => {
      if (mode === 'practice') return true;
      const record = scores[test._id];
      if (!record?.date) return true;
      const elapsed = Date.now() - new Date(record.date).getTime();
      if (elapsed < RETAKE_COOLDOWN_MS) {
        const remainingDays = Math.ceil((RETAKE_COOLDOWN_MS - elapsed) / (1000 * 60 * 60 * 24));
        toast.warning(
          `This test was completed recently. Please wait ${remainingDays} day${
            remainingDays > 1 ? 's' : ''
          } for a new attempt or use Practice Mode.`
        );
        return false;
      }
      return true;
    },
    [scores]
  );

  const buildAnswersPayload = useCallback(() => {
    if (!selectedTest) return [];
    const baseQuestions =
      originalTestRef.current?.questions?.length === selectedTest.questions.length
        ? originalTestRef.current.questions
        : null;
    const answersLength =
      baseQuestions?.length || originalTestRef.current?.questions?.length || selectedTest.questions.length;
    const answersArray = Array(answersLength).fill(-1);

    selectedTest.questions.forEach((question, displayIndex) => {
      const originalIndex = question.originalIndex ?? displayIndex;
      const userChoice = answers[displayIndex];
      if (userChoice === undefined) return;
      const mappedAnswer = question.optionOrder
        ? question.optionOrder[userChoice] ?? userChoice
        : userChoice;
      answersArray[originalIndex] = mappedAnswer;
    });

    return answersArray;
  }, [answers, selectedTest]);

  const handleSubmissionSuccess = useCallback(
    (
      testSnapshot,
      responseData,
      answersArray,
      timeSpentSeconds,
      autoSubmitFlag,
      timePerQuestion,
      explanationsPayload
    ) => {
      if (!testSnapshot?._id) return;

      const newScores = {
        ...scores,
        [testSnapshot._id]: {
          score: responseData.score,
          timeSpent: responseData.timeSpent,
          date: new Date().toISOString(),
          totalQuestions: responseData.totalQuestions,
          correctAnswers: responseData.correctAnswers,
          autoSubmitted: autoSubmitFlag,
        },
      };
      setScores(newScores);
      localStorage.setItem('testScores', JSON.stringify(newScores));

      setLastResult({
        testTitle: testSnapshot.title,
        score: responseData.score,
        correctAnswers: responseData.correctAnswers,
        totalQuestions: responseData.totalQuestions,
        timeSpent: responseData.timeSpent,
        autoSubmitted: autoSubmitFlag,
      });

      const baseQuestions = testSnapshot.questions || [];
      const customMetrics = calculateCustomScore(answersArray, baseQuestions, testSnapshot);
      const analyticsEntry = {
        date: new Date().toISOString(),
        timeSpent: timeSpentSeconds,
        timeSpentPerQuestion:
          timePerQuestion?.length === baseQuestions.length
            ? timePerQuestion
            : new Array(baseQuestions.length).fill(0),
        correctQuestions: customMetrics.correct,
        wrongQuestions: customMetrics.wrong,
        skippedQuestions: customMetrics.skipped,
        explanations: explanationsPayload ?? responseData.explanations ?? responseData.questionExplanations ?? null,
        source: 'official',
      };

      const nextAnalytics = {
        ...testAnalytics,
        [testSnapshot._id]: [...(testAnalytics[testSnapshot._id] || []), analyticsEntry],
      };
      setTestAnalytics(nextAnalytics);
      setJSON(STORAGE_KEYS.analytics, nextAnalytics);

      if (testSnapshot.weekNumber !== undefined && testSnapshot.weekNumber !== null) {
        const nextStreak =
          streakData.lastWeekCompleted === testSnapshot.weekNumber - 1
            ? streakData.streak + 1
            : 1;
        const streakPayload = { streak: nextStreak, lastWeekCompleted: testSnapshot.weekNumber };
        setStreakData(streakPayload);
        setJSON(STORAGE_KEYS.streak, streakPayload);

        const timeLimitSeconds = (testSnapshot.timeLimit || 0) * 60;
        const badges = evaluateBadges({
          accuracy: responseData.score,
          timeRatio: timeLimitSeconds ? timeSpentSeconds / timeLimitSeconds : 0,
          zeroMistakes: customMetrics.wrong.length === 0,
          streak: streakPayload.streak,
        });

        if (badges.length) {
          const nextBadges = {
            ...testBadges,
            [testSnapshot._id]: Array.from(
              new Set([...(testBadges[testSnapshot._id] || []), ...badges])
            ),
          };
          setTestBadges(nextBadges);
          setJSON(STORAGE_KEYS.badges, nextBadges);
        }
      }
    },
    [scores, streakData, testAnalytics, testBadges]
  );

  const queueOfflineSubmission = useCallback((entry) => {
    const queue = getJSON(STORAGE_KEYS.offline, []);
    queue.push(entry);
    setJSON(STORAGE_KEYS.offline, queue);
  }, []);

  const processOfflineSubmissions = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const queue = getJSON(STORAGE_KEYS.offline, []);
    if (!queue.length) return;

    const remaining = [];
    for (const submission of queue) {
      try {
        const response = await axios.post(
          'http://localhost:5000/api/tests/submit',
          submission.payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const snapshot =
          submission.testSnapshot ||
          tests.find((test) => test._id === submission.payload?.testId);

        handleSubmissionSuccess(
          snapshot,
          response.data,
          submission.answersArray,
          submission.payload.timeSpent,
          submission.autoSubmitted,
          submission.timePerQuestion,
          submission.explanations
        );
      } catch (err) {
        remaining.push(submission);
      }
    }

    setJSON(STORAGE_KEYS.offline, remaining);
  }, [handleSubmissionSuccess, tests]);

  useEffect(() => {
    processOfflineSubmissions();
  }, [processOfflineSubmissions]);

  const handlePracticeCompletion = useCallback(
    (answersArray, timeSpent, timePerQuestion) => {
      const baseTest = originalTestRef.current || selectedTest;
      if (!baseTest?._id) return;
      const baseQuestions = baseTest.questions || [];
      const practiceMetrics = calculateCustomScore(answersArray, baseQuestions, baseTest);
      const revealPayload = {
        ...practiceMetrics,
        answersArray,
        correctAnswers: baseQuestions.map((q) => q?.correctAnswer ?? null),
        explanations: baseQuestions.map((q) => q?.explanation ?? null),
      };
      setPracticeRevealData(revealPayload);

      const analyticsEntry = {
        date: new Date().toISOString(),
        timeSpent,
        timeSpentPerQuestion:
          timePerQuestion?.length === baseQuestions.length
            ? timePerQuestion
            : new Array(baseQuestions.length).fill(0),
        correctQuestions: practiceMetrics.correct,
        wrongQuestions: practiceMetrics.wrong,
        skippedQuestions: practiceMetrics.skipped,
        explanations: revealPayload.explanations,
        source: 'practice',
      };

      const nextAnalytics = {
        ...testAnalytics,
        [baseTest._id]: [...(testAnalytics[baseTest._id] || []), analyticsEntry],
      };
      setTestAnalytics(nextAnalytics);
      setJSON(STORAGE_KEYS.analytics, nextAnalytics);
    },
    [selectedTest, testAnalytics]
  );

  useEffect(() => {
    if (practiceRevealData) {
      setJSON(STORAGE_KEYS.practiceReveal, practiceRevealData);
    }
  }, [practiceRevealData]);

  const handleStartTest = (test, mode = 'standard') => {
    if (!localStorage.getItem('token')) {
      toast.error('Please login to start the test');
      return;
    }

    const isPractice = mode === 'practice';
    if (isPractice && !scores[test._id]) {
      toast.error('Practice Mode unlocks after you complete this test once.');
      return;
    }
    if (!canAttemptTest(test, mode)) {
      return;
    }

    const { randomizedQuestions, randomizationMeta: meta } = buildRandomizedSession(test);
    originalTestRef.current = test;
    questionTimeSpentRef.current = new Array(randomizedQuestions.length).fill(0);
    activeQuestionRef.current = 0;

    setSelectedTest({ ...test, questions: randomizedQuestions });
    setRandomizationMeta(meta);
    setAnswers({});
    setTimeLeft(test.timeLimit * 60);
    setStartTime(Date.now());
    setAutoSubmitted(false);
    setPracticeMode(isPractice);
    setCheatingWarnings(0);
    setAutoSubmitTriggered(false);
    setPracticeRevealData(null);
    setReviewOpen(false);
    setLastResult((prev) => (isPractice ? prev : null));
  };

  const handleAnswerChange = (questionIndex, value) => {
    activeQuestionRef.current = questionIndex;
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmitTest = useCallback(async () => {
    if (!selectedTest || submitting) return;

    const answersArray = buildAnswersPayload();
    const timeSpent = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    const timePerQuestion = selectedTest.questions.map(
      (_, idx) => questionTimeSpentRef.current[idx] || 0
    );

    if (practiceMode) {
      handlePracticeCompletion(answersArray, timeSpent, timePerQuestion);
      toast.success('Practice attempt recorded. Review data saved.');
      resetWorkingState();
      return;
    }

    if (!canAttemptTest(selectedTest)) {
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to submit the test');
      }

      const payload = {
        testId: selectedTest._id,
        answers: answersArray,
        timeSpent,
      };

      let responseData;
      try {
        const response = await axios.post('http://localhost:5000/api/tests/submit', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        responseData = response.data;
      } catch (submitError) {
        queueOfflineSubmission({
          payload,
          answersArray,
          timePerQuestion,
          autoSubmitted: autoSubmitted || autoSubmitTriggered,
          testSnapshot: originalTestRef.current || selectedTest,
        });
        toast.error('Network issue detected. Attempt saved offline and will retry automatically.');
        resetWorkingState();
        return;
      }

      handleSubmissionSuccess(
        originalTestRef.current || selectedTest,
        responseData,
        answersArray,
        timeSpent,
        autoSubmitted || autoSubmitTriggered,
        timePerQuestion
      );

      toast.success(
        `Test ${autoSubmitted ? 'auto-submitted' : 'completed'}! Score: ${responseData.score}%`,
        {
          duration: 5000,
          description: `Accuracy: ${responseData.correctAnswers}/${responseData.totalQuestions}`,
        }
      );

      resetWorkingState();
    } catch (submitError) {
      console.error('Failed to submit test:', submitError);
      const errorMessage = submitError.response?.data?.message || submitError.message;
      toast.error(errorMessage, {
        duration: 5000,
        description: submitError.response?.data?.error || 'Please try again',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    autoSubmitTriggered,
    autoSubmitted,
    buildAnswersPayload,
    canAttemptTest,
    handlePracticeCompletion,
    handleSubmissionSuccess,
    practiceMode,
    queueOfflineSubmission,
    resetWorkingState,
    selectedTest,
    startTime,
    submitting,
  ]);

  useEffect(() => {
    if (!selectedTest || timeLeft === null) return undefined;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(interval);
          setAutoSubmitted(true);
          setAutoSubmitTriggered(true);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTest, timeLeft, handleSubmitTest]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!selectedTest || practiceMode) return;
      if (document.hidden) {
        setCheatingWarnings((prev) => {
          const next = prev + 1;
          if (next >= CHEAT_LIMIT && !autoSubmitTriggered) {
            toast.error('Multiple tab switches detected. Auto-submitting your responses.');
            setAutoSubmitted(true);
            setAutoSubmitTriggered(true);
            handleSubmitTest();
          } else if (next < CHEAT_LIMIT) {
            toast.warning(`Focus on the test tab (${next}/${CHEAT_LIMIT} warnings).`);
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedTest, practiceMode, autoSubmitTriggered, handleSubmitTest]);

  const timerPercentage = useMemo(() => {
    if (!selectedTest || !timeLeft) return 1;
    return Math.max(timeLeft / (selectedTest.timeLimit * 60), 0);
  }, [selectedTest, timeLeft]);

  useEffect(() => {
    if (!selectedTest) return undefined;
    const interval = setInterval(() => {
      const activeIndex = activeQuestionRef.current || 0;
      if (!questionTimeSpentRef.current.length) {
        questionTimeSpentRef.current = new Array(selectedTest.questions.length).fill(0);
      }
      questionTimeSpentRef.current[activeIndex] =
        (questionTimeSpentRef.current[activeIndex] || 0) + 1;
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTest]);

  const attemptedQuestions = useMemo(() => {
    if (!selectedTest) return [];
    return selectedTest.questions
      .map((question, idx) => ({
        ...question,
        index: idx,
        answered: answers[idx] !== undefined,
      }))
      .filter((item) => item.answered);
  }, [selectedTest, answers]);

  const unattemptedQuestions = useMemo(() => {
    if (!selectedTest) return [];
    return selectedTest.questions
      .map((question, idx) => ({
        ...question,
        index: idx,
        answered: answers[idx] !== undefined,
      }))
      .filter((item) => !item.answered);
  }, [selectedTest, answers]);

  const handleJumpToQuestion = (index) => {
    const el = document.getElementById(`question-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setReviewOpen(false);
      activeQuestionRef.current = index;
    }
  };

  const renderFloatingTimer = () => {
    if (!selectedTest || timeLeft === null) return null;
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 right-6 z-50"
      >
        <div
          className={`flex items-center gap-3 rounded-full px-5 py-3 shadow-sm border ${
            timerPercentage > 0.6
              ? 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white'
              : timerPercentage > 0.2
              ? 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white'
              : 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900 animate-pulse'
          }`}
        >
          <Timer className="h-5 w-5" />
          <span className="font-semibold tracking-wide">{formatTime(timeLeft)}</span>
        </div>
      </motion.div>
    );
  };

  const renderResultPanel = () => {
    if (!lastResult) return null;

    const incorrect = lastResult.totalQuestions - lastResult.correctAnswers;
    const accuracy = Math.round((lastResult.correctAnswers / lastResult.totalQuestions) * 100);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-8"
        >
          <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <motion.div
                  className="relative h-36 w-36 flex items-center justify-center"
                  animate={{ scale: [0.95, 1, 0.95] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div
                    className="h-full w-full rounded-full border-4 border-gray-200 dark:border-neutral-700 flex items-center justify-center"
                    style={{
                      background: `conic-gradient(currentColor ${lastResult.score}%, rgba(148,163,184,.3) ${lastResult.score}%)`,
                      color: 'currentColor'
                    }}
                  >
                    <div className="h-28 w-28 rounded-full bg-white dark:bg-neutral-900 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{lastResult.score}%</span>
                      <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
                        Score
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="flex-1 space-y-4 text-gray-900 dark:text-white">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-600 dark:text-gray-400">
                      Completed
                    </p>
                    <h2 className="text-2xl font-semibold">{lastResult.testTitle}</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 border border-gray-200 dark:border-neutral-700">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Accuracy</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{accuracy}%</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 border border-gray-200 dark:border-neutral-700">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Correct</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lastResult.correctAnswers}/{lastResult.totalQuestions}
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 border border-gray-200 dark:border-neutral-700">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Incorrect</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{incorrect}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 border border-gray-200 dark:border-neutral-700">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Time</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatTime(lastResult.timeSpent)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderReviewModal = () => (
    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Layers className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Review Before Submit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Attempted</p>
              <Badge variant="secondary">{attemptedQuestions.length}</Badge>
            </div>
            <div className="grid gap-2">
              {attemptedQuestions.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No questions answered yet.</p>
              )}
              {attemptedQuestions.map((question) => (
                <div
                  key={question.index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 px-3 py-2"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Q{question.index + 1}: {question.question.slice(0, 60)}
                    {question.question.length > 60 ? '…' : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
                    onClick={() => handleJumpToQuestion(question.index)}
                  >
                    Jump
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-gray-200 dark:bg-neutral-800" />

          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Unattempted</p>
              <Badge variant="destructive">{unattemptedQuestions.length}</Badge>
            </div>
            <div className="grid gap-2">
              {unattemptedQuestions.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Great! Everything is answered.</p>
              )}
              {unattemptedQuestions.map((question) => (
                <div
                  key={question.index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 px-3 py-2"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Q{question.index + 1}: {question.question.slice(0, 60)}
                    {question.question.length > 60 ? '…' : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
                    onClick={() => handleJumpToQuestion(question.index)}
                  >
                    Jump
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setReviewOpen(false)}>
            Continue Editing
          </Button>
          <Button onClick={handleSubmitTest} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderQuestionCard = (question, qIndex) => (
    <motion.div
      key={qIndex}
      layout
      id={`question-${qIndex}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: qIndex * 0.02 }}
    >
      <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="space-y-1">
          <Badge variant="outline" className="w-fit text-xs uppercase tracking-wide">
            Question {qIndex + 1}
          </Badge>
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup
            value={
              answers[qIndex] !== undefined ? String(answers[qIndex]) : undefined
            }
            onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value, 10))}
            className="space-y-2"
          >
            {question.options.map((option, oIndex) => (
              <Label
                key={oIndex}
                htmlFor={`q${qIndex}-o${oIndex}`}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  answers[qIndex] === oIndex
                    ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-neutral-800'
                    : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem
                    value={String(oIndex)}
                    id={`q${qIndex}-o${oIndex}`}
                  />
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </div>
                {answers[qIndex] === oIndex && (
                  <CheckCircle2 className="h-5 w-5 text-gray-900 dark:text-white" />
                )}
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderActiveTest = () => {
    if (!selectedTest) return null;

    return (
      <div className="relative">
        {renderFloatingTimer()}
        {renderReviewModal()}

        <motion.div
          layout
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm">
            <div className="bg-gray-100 dark:bg-neutral-800 p-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-neutral-700">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-600 dark:text-gray-400">
                    Week {selectedTest.weekNumber}
                  </p>
                  <h1 className="text-3xl font-semibold">{selectedTest.title}</h1>
                  {practiceMode && (
                    <Badge variant="secondary" className="mt-3 bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white">
                      Practice Mode
                    </Badge>
                  )}
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3">
                    <p className="text-gray-600 dark:text-gray-400">Questions</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {answeredCount}/{selectedTest.questions.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3">
                    <p className="text-gray-600 dark:text-gray-400">Time Limit</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedTest.timeLimit} min
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="space-y-6 p-6">
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Answered</span>
                  <span>
                    {answeredCount}/{selectedTest.questions.length}
                  </span>
                </div>
                <Progress
                  value={(answeredCount / selectedTest.questions.length) * 100}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => resetWorkingState()}
                  className="gap-2 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Exit Test
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
                  onClick={() => setReviewOpen(true)}
                  disabled={!selectedTest.questions.length}
                >
                  <HelpCircle className="h-4 w-4" />
                  Review Before Submit
                </Button>
                <Button 
                  onClick={handleSubmitTest} 
                  disabled={submitting}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 border border-gray-900 dark:border-white"
                >
                  {submitting
                    ? 'Submitting…'
                    : practiceMode
                    ? 'Finish Practice'
                    : 'Submit Test'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <AnimatePresence>
              {selectedTest.questions.map((question, index) =>
                renderQuestionCard(question, index)
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderTestCard = (test) => {
    const isCompleted = Boolean(scores[test._id]);
    const score = scores[test._id];
    const lastAttemptTime = score?.date ? new Date(score.date).getTime() : null;
    const cooldownActive =
      lastAttemptTime !== null && Date.now() - lastAttemptTime < RETAKE_COOLDOWN_MS;
    const canStartStandard = !isCompleted || !cooldownActive;
    const buttonLabel = !isCompleted
      ? 'Start Test'
      : canStartStandard
      ? 'Retake Test'
      : 'Test Completed';
    const answeredBadge = score?.autoSubmitted ? 'Auto Submitted' : 'Completed';

    return (
      <motion.div
        layout
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Card className="relative overflow-visible bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all h-full flex flex-col min-h-[400px]">
          {isCompleted && (
            <div className="absolute right-0 top-4 rotate-45 bg-gray-900 dark:bg-white px-12 py-1 text-xs font-semibold uppercase text-white dark:text-gray-900 shadow-sm z-10">
              {answeredBadge}
            </div>
          )}

          <CardHeader className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white p-6 border-b border-gray-200 dark:border-neutral-800">
            <div className="mb-3 min-h-[3.5rem] flex items-start">
              <CardTitle 
                className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group relative"
                title={test.title.length > 50 ? test.title : undefined}
              >
                {test.title.length > 50 ? (
                  <span className="block line-clamp-2 group-hover:line-clamp-none group-hover:absolute group-hover:z-20 group-hover:bg-white dark:group-hover:bg-neutral-900 group-hover:p-3 group-hover:rounded-lg group-hover:shadow-lg group-hover:border group-hover:border-gray-200 dark:group-hover:border-neutral-800 group-hover:max-w-xs group-hover:whitespace-normal">
                    {test.title}
                  </span>
                ) : (
                  <span>{test.title}</span>
                )}
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Week {test.weekNumber}
            </CardDescription>
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                {test.timeLimit} min
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {test.questions.length} Qs
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-4 p-6">
            {isCompleted && score && (
              <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {score.score}%
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {score.correctAnswers}/{score.totalQuestions} correct
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {score.autoSubmitted ? 'Auto submitted' : 'Completed manually'} ·{' '}
                  {new Date(score.date).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-6 pt-0 flex flex-col gap-3">
            <Button
              className="w-full gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 border border-gray-900 dark:border-white"
              onClick={() => handleStartTest(test)}
              disabled={!canStartStandard}
            >
              <>
                {buttonLabel}
                <ChevronRight className="h-4 w-4" />
              </>
            </Button>

            {isCompleted && (
              <Button
                variant="outline"
                className="w-full gap-2 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
                onClick={() => handleStartTest(test, 'practice')}
              >
                <Repeat className="h-4 w-4" />
                Practice Mode
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  const renderTestsGrid = () => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Weekly Tests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Test your knowledge with weekly assessments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <Target className="text-2xl text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalScoreSnapshot.averageScore}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <Layers className="text-2xl text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tests Taken</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalScoreSnapshot.totalTests}</p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        layout
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {tests.map((test, index) => (
          <motion.div
            key={test._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="h-full"
          >
            {renderTestCard(test)}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderFallback = (state) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      {state === 'loading' ? (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white mx-auto mb-4"></div>
            <p className="text-lg text-gray-900 dark:text-white">Fetching curated weekly tests…</p>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-8 max-w-md shadow-sm"
          >
            <AlertTriangle className="h-10 w-10 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 dark:text-white mb-6">{error}</p>
            <motion.button
              onClick={fetchTests}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 py-2.5 px-5 rounded-lg transition-colors shadow-sm mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="p-6 pt-24 pb-12 max-w-6xl mx-auto">
        {renderResultPanel()}
        {loading && renderFallback('loading')}
        {!loading && error && renderFallback('error')}
        {!loading && !error && !selectedTest && renderTestsGrid()}
        {!loading && !error && selectedTest && renderActiveTest()}
      </div>
    </div>
  );
};

export default WeeklyTest;