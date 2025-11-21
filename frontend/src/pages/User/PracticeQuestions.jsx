import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Target,
  ExternalLink,
  Search,
  ChevronDown,
  X,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/Progress';
import Skeleton from '@/components/ui/Skeleton';
import {
  getProgress,
  toggleQuestionCompleted,
  toggleQuestionBookmarked,
  recordQuestionOpened,
  getQuestionMeta,
  getQuestionAttemptSummary,
  calculateProgressStats,
} from '@/utils/progressUtils';

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const PracticeQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    topic: 'all',
    status: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [progressData, setProgressData] = useState(() => getProgress());

  // Sync progress data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProgressData(getProgress());
    };
    window.addEventListener('storage', handleStorageChange);
    // Also check on focus in case of same-tab updates
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(response.data);
      // Expand first topic by default
      if (response.data.length > 0) {
        setExpandedTopics(new Set([0]));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load questions');
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleQuestionOpen = (questionUrl) => {
    recordQuestionOpened(questionUrl);
    setProgressData(getProgress());
  };

  const handleBookmark = (questionUrl) => {
    const { progress, isBookmarked } = toggleQuestionBookmarked(questionUrl);
    setProgressData(progress);
    toast.success(isBookmarked ? 'Question bookmarked' : 'Bookmark removed');
  };

  const handleComplete = (questionUrl, isCorrect = true) => {
    const { progress, isCompleted } = toggleQuestionCompleted(questionUrl, {
      success: isCorrect,
    });
    setProgressData(progress);
    toast[isCompleted ? 'success' : 'info'](
      isCompleted ? 'Question marked as completed' : 'Question marked as pending'
    );
  };

  const toggleTopic = (index) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Calculate analytics using unified storage
  const analytics = useMemo(() => {
    return calculateProgressStats(questions, progressData);
  }, [questions, progressData]);

  const filteredQuestions = useMemo(() => {
    const completedSet = new Set(progressData.completed);
    const bookmarkedSet = new Set(progressData.bookmarked);
    
    return questions
      .filter((topic) => {
        if (filters.topic !== 'all' && topic.topic !== filters.topic) return false;
        return true;
      })
      .map((topic) => ({
        ...topic,
        questions: topic.questions.filter((q) => {
          const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus =
            filters.status === 'all'
              ? true
              : filters.status === 'completed'
              ? completedSet.has(q.url)
              : filters.status === 'pending'
              ? !completedSet.has(q.url)
              : filters.status === 'bookmarked'
              ? bookmarkedSet.has(q.url)
              : true;
          const matchesDifficulty =
            filters.difficulty === 'all' ||
            (q.difficulty && q.difficulty.toLowerCase() === filters.difficulty.toLowerCase());
          return matchesSearch && matchesStatus && matchesDifficulty;
        }),
      }))
      .filter((topic) => topic.questions.length > 0);
  }, [questions, filters, searchQuery, progressData]);

  const topicOptions = [
    { value: 'all', label: 'All Topics' },
    ...questions.map((topic) => ({
      value: topic.topic,
      label: topic.topic,
    })),
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'bookmarked', label: 'Bookmarked' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="space-y-6">
          <Skeleton variant="title" className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
            <X className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <motion.button
            onClick={fetchQuestions}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 py-2.5 px-5 rounded-lg transition-colors shadow-sm mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const completedSet = new Set(progressData.completed);
  const bookmarkedSet = new Set(progressData.bookmarked);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="p-6 pt-24 pb-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                DSA Practice Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Master data structures and algorithms</p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Topic</label>
                    <select
                      value={filters.topic}
                      onChange={(e) => setFilters((prev) => ({ ...prev, topic: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white"
                    >
                      {topicOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white"
                    >
                      {difficultyOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Questions by Topic */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredQuestions.map((topic, topicIndex) => {
                const isExpanded = expandedTopics.has(topicIndex);
                return (
                  <motion.div
                    key={`topic-${topic.topic}-${topicIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: topicIndex * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <button
                        onClick={() => toggleTopic(topicIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-semibold text-gray-900">{topic.topic}</h2>
                          <Badge variant="secondary">
                            {topic.questions.length} question{topic.questions.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-500 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {topic.questions.map((question, qIndex) => {
                                  const questionKey = `question-${topic.topic}-${question.url}-${qIndex}`;
                                  const isBookmarked = bookmarkedSet.has(question.url);
                                  const isCompleted = completedSet.has(question.url);
                                  const metadata = getQuestionMeta(question.url);
                                  const attempts = getQuestionAttemptSummary(question.url);
                                  const difficulty = question.difficulty || 'medium';

                                  return (
                                    <motion.div
                                      key={questionKey}
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: qIndex * 0.05 }}
                                      whileHover={{ y: -4 }}
                                    >
                                      <Card className="h-full hover:shadow-md transition-all duration-300 border-l-4 border-l-gray-900 dark:border-l-white bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
                                        <CardContent className="p-5">
                                          <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-lg text-gray-900 flex-1 pr-2">
                                              {question.question}
                                            </h3>
                                            <div className="flex gap-2 flex-shrink-0">
                                              <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleBookmark(question.url)}
                                                className={`p-2 rounded-full transition-colors ${
                                                  isBookmarked
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                                title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                                              >
                                                <Bookmark
                                                  className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
                                                />
                                              </motion.button>
                                              <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleComplete(question.url)}
                                                className={`p-2 rounded-full transition-colors ${
                                                  isCompleted
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                                title={
                                                  isCompleted ? 'Mark as Pending' : 'Mark as Completed'
                                                }
                                              >
                                                {isCompleted ? (
                                                  <CheckCircle2 className="h-4 w-4" />
                                                ) : (
                                                  <Target className="h-4 w-4" />
                                                )}
                                              </motion.button>
                                            </div>
                                          </div>

                                          <div className="flex flex-wrap gap-2 mb-3">
                                            <Badge
                                              className={`${getDifficultyColor(difficulty)} border`}
                                            >
                                              {difficulty}
                                            </Badge>
                                            {isCompleted && (
                                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                                Completed
                                              </Badge>
                                            )}
                                            {isBookmarked && (
                                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                Bookmarked
                                              </Badge>
                                            )}
                                          </div>

                                          {metadata.lastOpened && (
                                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              Last opened:{' '}
                                              {new Date(metadata.lastOpened).toLocaleDateString()}
                                            </div>
                                          )}

                                          {(attempts.successCount > 0 || attempts.failureCount > 0) && (
                                            <div className="text-xs text-gray-600 mb-3">
                                              <span className="text-green-600">
                                                ✓ {attempts.successCount}
                                              </span>{' '}
                                              <span className="text-red-600">
                                                ✗ {attempts.failureCount}
                                              </span>
                                            </div>
                                          )}

                                          <a
                                            href={question.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => handleQuestionOpen(question.url)}
                                            className="inline-flex items-center gap-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium text-sm transition-colors"
                                          >
                                            Solve Problem
                                            <ExternalLink className="h-4 w-4" />
                                          </a>
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredQuestions.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <p>No questions found matching your filters.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky top-6 space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {analytics.overallProgress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={analytics.overallProgress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.completedCount} of {analytics.totalQuestions} completed
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {analytics.completedCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bookmarked</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {analytics.bookmarkedCount}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Topic Progress</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {analytics.topicProgress.map((stat) => (
                      <div key={stat.topic}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700 truncate">
                            {stat.topic}
                          </span>
                          <span className="text-xs text-gray-600">
                            {stat.completed}/{stat.total}
                          </span>
                        </div>
                        <Progress value={stat.progress} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PracticeQuestions;
