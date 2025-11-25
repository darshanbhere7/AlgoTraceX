import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Award,
  Download,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  X,
  Bookmark,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/button';
import { buildApiUrl } from '@/config/api';
import { Badge } from '@/components/ui/badge';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
} from 'recharts';
import RadarChart from '@/components/charts/RadarChart';
import StreakHeatmap from '@/components/charts/StreakHeatmap';
import ActivityTimeline from '@/components/analytics/ActivityTimeline';
import AchievementBadge from '@/components/analytics/AchievementBadge';
import { generatePDFReport } from '@/components/analytics/PDFReportGenerator';
import { TrendingUp, TrendingDown, Lightbulb, Zap } from 'lucide-react';
import {
  getProgress,
  calculateProgressStats,
  getDisplayStreak,
  getActivitySeries,
} from '@/utils/progressUtils';

const STORAGE_KEYS = {
  badges: 'weeklyTest.badges',
};

const getJSON = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [topicFilter, setTopicFilter] = useState('all'); // 'all', 'high', 'low', 'completed'
  const [badges, setBadges] = useState(() => getJSON(STORAGE_KEYS.badges, {}));
  const [recentActivity, setRecentActivity] = useState([]);
  const [progressData, setProgressData] = useState(() => getProgress());
  const [heatmapRange, setHeatmapRange] = useState(60);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all practice questions
        const questionsResponse = await axios.get(buildApiUrl('/questions'));
        setAllQuestions(questionsResponse.data);

        // Load unified progress data from localStorage
        const unifiedProgress = getProgress();
        setProgressData(unifiedProgress);

        // Fetch test results from localStorage
        const savedScores = localStorage.getItem('testScores');
        let formattedTestResults = [];
        if (savedScores) {
          const parsedScores = JSON.parse(savedScores);
          formattedTestResults = Object.keys(parsedScores).map((testId) => ({
            id: testId,
            name: `Test ${testId.substring(0, 8)}...`,
            score: parsedScores[testId].score,
            date: new Date(parsedScores[testId].date),
            dateString: new Date(parsedScores[testId].date).toLocaleDateString(),
            correctAnswers: parsedScores[testId].correctAnswers,
            totalQuestions: parsedScores[testId].totalQuestions,
          }));
          setTestResults(formattedTestResults.sort((a, b) => b.date - a.date));
        }

        // Load badges
        const savedBadges = getJSON(STORAGE_KEYS.badges, {});
        setBadges(savedBadges);

        // Build recent activity timeline from unified progress
        buildRecentActivity(unifiedProgress, formattedTestResults || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load progress data');
        toast.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync progress data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProgressData(getProgress());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const buildRecentActivity = useCallback((progressSnapshot, testsSnapshot = []) => {
    const activities = [];

    Object.entries(progressSnapshot.activityLog || {}).forEach(([date, metrics]) => {
      const parsedDate = new Date(`${date}T00:00:00`);
      if (metrics.completed > 0) {
        activities.push({
          type: 'practice',
          title: 'Practice Session',
          description: `${metrics.completed} question(s) completed`,
          date: parsedDate,
          icon: CheckCircle2,
          color: COLORS.success,
        });
      }
      if (metrics.bookmarked > 0) {
        activities.push({
          type: 'bookmark',
          title: 'Bookmarked Questions',
          description: `${metrics.bookmarked} question(s) bookmarked`,
          date: parsedDate,
          icon: Bookmark,
          color: COLORS.warning,
        });
      }
    });

    testsSnapshot.forEach((test) => {
      if (test?.date) {
        activities.push({
          type: 'test',
          title: 'Completed Weekly Test',
          description: `Score: ${test.score || 0}% (${test.correctAnswers || 0}/${test.totalQuestions || 0})`,
          date: test.date,
          icon: Target,
          color: COLORS.primary,
        });
      }
    });

    const sorted = activities.sort((a, b) => b.date - a.date).slice(0, 10);
    setRecentActivity(sorted);
  }, []);

  useEffect(() => {
    buildRecentActivity(progressData, testResults);
  }, [progressData, testResults, buildRecentActivity]);

  // Calculate progress using unified storage utility
  const progressStats = useMemo(() => {
    return calculateProgressStats(allQuestions, progressData);
  }, [allQuestions, progressData]);

  const { totalQuestions, completedCount, bookmarkedCount, overallProgress, topicProgress } = progressStats;
  const currentStreak = progressData.streak?.current || 0;
  const displayStreak = getDisplayStreak(progressData);

  // Filter topics based on selected filter
  const filteredTopics = useMemo(() => {
    switch (topicFilter) {
      case 'high':
        return topicProgress.filter((t) => t.progress >= 70);
      case 'low':
        return topicProgress.filter((t) => t.progress < 50 && t.progress > 0);
      case 'completed':
        return topicProgress.filter((t) => t.progress === 100);
      default:
        return topicProgress;
    }
  }, [topicProgress, topicFilter]);

  // Prepare data for charts
  const donutChartData = useMemo(() => {
    return [
      { name: 'Completed', value: completedCount, color: COLORS.success },
      { name: 'Remaining', value: Math.max(0, totalQuestions - completedCount), color: '#e5e7eb' },
    ];
  }, [completedCount, totalQuestions, progressData]);

  const barChartData = useMemo(() => {
    return filteredTopics.map((topic) => ({
      name: topic.topic.length > 15 ? `${topic.topic.substring(0, 15)}...` : topic.topic,
      progress: topic.progress,
      completed: topic.completed,
      total: topic.total,
    }));
  }, [filteredTopics]);

  const lineChartData = useMemo(() => {
    return testResults
      .sort((a, b) => a.date - b.date)
      .map((test, index) => ({
        name: `Week ${index + 1}`,
        score: test.score,
        date: test.dateString,
      }));
  }, [testResults]);

  // Calculate achievements
  const achievements = useMemo(() => {
    const allBadges = Object.values(badges).flat();
    const uniqueBadges = Array.from(new Set(allBadges));
    
    const calculated = [];
    
    // Overall progress badges
    if (overallProgress >= 100) calculated.push({ name: 'Master', icon: Award, color: COLORS.purple });
    else if (overallProgress >= 75) calculated.push({ name: 'Expert', icon: Award, color: COLORS.primary });
    else if (overallProgress >= 50) calculated.push({ name: 'Advanced', icon: Award, color: COLORS.success });
    else if (overallProgress >= 25) calculated.push({ name: 'Intermediate', icon: Award, color: COLORS.warning });

    // Streak badges
    if (currentStreak >= 10) calculated.push({ name: 'Fire Master', icon: Flame, color: COLORS.danger });
    else if (currentStreak >= 5) calculated.push({ name: 'On Fire', icon: Flame, color: COLORS.warning });
    else if (currentStreak >= 3) calculated.push({ name: 'Streak Starter', icon: Flame, color: COLORS.success });

    // Test performance badges
    const avgTestScore = testResults.length > 0
      ? testResults.reduce((sum, t) => sum + t.score, 0) / testResults.length
      : 0;
    if (avgTestScore >= 90 && testResults.length >= 3)
      calculated.push({ name: 'Test Master', icon: Target, color: COLORS.purple });
    else if (avgTestScore >= 80 && testResults.length >= 2)
      calculated.push({ name: 'Test Expert', icon: Target, color: COLORS.primary });

    // Question completion badges
    if (completedCount >= 100) calculated.push({ name: 'Centurion', icon: CheckCircle2, color: COLORS.purple });
    else if (completedCount >= 50) calculated.push({ name: 'Half Century', icon: CheckCircle2, color: COLORS.primary });

    return calculated;
  }, [overallProgress, currentStreak, testResults, completedCount, badges]);

  // Calculate difficulty-wise performance
  const difficultyData = useMemo(() => {
    const difficultyStats = { easy: 0, medium: 0, hard: 0 };
    const difficultyCompleted = { easy: 0, medium: 0, hard: 0 };
    const completedSet = new Set(progressData.completed);

    allQuestions.forEach((topic) => {
      topic.questions.forEach((q) => {
        const difficulty = (q.difficulty || 'medium').toLowerCase();
        if (difficultyStats.hasOwnProperty(difficulty)) {
          difficultyStats[difficulty]++;
          if (completedSet.has(q.url)) {
            difficultyCompleted[difficulty]++;
          }
        }
      });
    });

    return [
      {
        subject: 'Easy',
        value: difficultyStats.easy > 0 ? (difficultyCompleted.easy / difficultyStats.easy) * 100 : 0,
        fullMark: 100,
      },
      {
        subject: 'Medium',
        value: difficultyStats.medium > 0 ? (difficultyCompleted.medium / difficultyStats.medium) * 100 : 0,
        fullMark: 100,
      },
      {
        subject: 'Hard',
        value: difficultyStats.hard > 0 ? (difficultyCompleted.hard / difficultyStats.hard) * 100 : 0,
        fullMark: 100,
      },
    ];
  }, [allQuestions, progressData]);

  // Generate streak heatmap data
  const streakHeatmapData = useMemo(() => {
    return getActivitySeries(progressData, heatmapRange);
  }, [progressData, heatmapRange]);

  // Smart Insights
  const insights = useMemo(() => {
    const insightsList = [];

    // Progress insights
    if (overallProgress >= 75) {
      insightsList.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Excellent Progress!',
        message: `You've completed ${overallProgress.toFixed(1)}% of all questions. Keep up the momentum!`,
      });
    } else if (overallProgress >= 50) {
      insightsList.push({
        type: 'info',
        icon: TrendingUp,
        title: 'Good Progress',
        message: `You're halfway there! Complete more questions to unlock advanced badges.`,
      });
    } else if (overallProgress < 25) {
      insightsList.push({
        type: 'warning',
        icon: Lightbulb,
        title: 'Getting Started',
        message: 'Start with easier topics to build confidence and maintain your streak.',
      });
    }

    // Streak insights
    if (currentStreak >= 7) {
      insightsList.push({
        type: 'success',
        icon: Flame,
        title: 'On Fire!',
        message: `Amazing ${currentStreak}-day streak! Consistency is key to mastery.`,
      });
    } else if (currentStreak === 0) {
      insightsList.push({
        type: 'warning',
        icon: Zap,
        title: 'Start Your Streak',
        message: 'Complete at least one question today to begin your learning streak!',
      });
    }

    // Test performance insights
    if (testResults.length > 0) {
      const recentScores = testResults.slice(0, 3).map((t) => t.score);
      const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      if (avgRecent >= 85) {
        insightsList.push({
          type: 'success',
          icon: Target,
          title: 'Test Master',
          message: `Your average test score is ${avgRecent.toFixed(1)}%. Outstanding performance!`,
        });
      } else if (avgRecent < 60 && testResults.length >= 2) {
        insightsList.push({
          type: 'warning',
          icon: Lightbulb,
          title: 'Review Needed',
          message: 'Consider reviewing completed questions to improve test performance.',
        });
      }
    }

    // Topic insights
    const lowProgressTopics = topicProgress.filter((t) => t.progress < 30 && t.progress > 0);
    if (lowProgressTopics.length > 0) {
      insightsList.push({
        type: 'info',
        icon: Lightbulb,
        title: 'Focus Areas',
        message: `${lowProgressTopics.length} topic(s) need more attention. Consider revisiting them.`,
      });
    }

    return insightsList;
  }, [overallProgress, currentStreak, testResults, topicProgress]);

  // Comparison Analytics (Last 7 days vs Previous 7 days)
  const comparisonData = useMemo(() => {
    const today = new Date();
    const last7Days = [];
    const previous7Days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    for (let i = 7; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      previous7Days.push(date.toISOString().split('T')[0]);
    }

    const sumForDates = (dates) =>
      dates.reduce(
        (acc, dateKey) => acc + (progressData.activityLog?.[dateKey]?.completed || 0),
        0
      );

    const last7Count = sumForDates(last7Days);
    const previous7Count = sumForDates(previous7Days);

    const change = last7Count - previous7Count;
    const changePercent = previous7Count > 0 ? ((change / previous7Count) * 100).toFixed(1) : 0;

    return {
      last7Days: last7Count,
      previous7Days: previous7Count,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  }, [progressData]);

  const handleDownloadPDF = async () => {
    try {
      toast.info('Generating PDF report...', { duration: 2000 });
      
      // Wait a bit to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reportData = {
        overallProgress,
        completedCount,
        totalQuestions,
        topicProgress,
        testResults,
        streak: progressData.streak,
        achievements,
        recentActivity,
      };
      
      const result = await generatePDFReport(reportData);
      
      if (result && result.success) {
        toast.success(`PDF report generated successfully!`, {
          description: `File: ${result.fileName}`,
          duration: 4000,
        });
      } else {
        toast.success('PDF report generated successfully!');
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      const errorMessage = error.message || 'Failed to generate PDF report';
      toast.error('Failed to generate PDF report', {
        description: errorMessage.includes('not available') 
          ? 'Please install required packages: npm install jspdf html2canvas'
          : errorMessage,
        duration: 5000,
      });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-lg text-gray-900 dark:text-white">Loading Progress...</p>
        </motion.div>
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
            onClick={handleRefresh}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="p-6 pt-24 pb-12 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Learning Progress</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your DSA journey and achievements</p>
        </div>
        <motion.button
          onClick={handleDownloadPDF}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 py-2.5 px-5 rounded-lg transition-colors shadow-sm w-full md:w-auto"
        >
          <Download className="h-4 w-4" />
          Download Report (PDF)
        </motion.button>
      </motion.div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallProgress.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-800 rounded-full p-3">
                  <PieChart className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedCount} of {totalQuestions} questions
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Daily Streak</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{displayStreak || 0} days</p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-800 rounded-full p-3">
                  <Flame className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Keep the fire burning!</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tests Completed</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{testResults.length}</p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-800 rounded-full p-3">
                  <Target className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Weekly assessments</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Achievements</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{achievements.length}</p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-800 rounded-full p-3">
                  <Award className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Badges unlocked</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Overall Progress with Donut Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Overall DSA Progress
            </CardTitle>
            <CardDescription>Your complete learning journey overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white">{overallProgress.toFixed(1)}%</div>
                  <div className="flex-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    >
                      <Progress value={overallProgress} className="h-4" />
                    </motion.div>
                    <p className="text-sm text-gray-600 mt-2">
                      {completedCount} of {totalQuestions} questions completed
                    </p>
                  </div>
                </div>
              </div>
              <div id="pdf-overall-chart" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={donutChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {donutChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Topic-wise Progress with Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Topic-wise Progress
                </CardTitle>
                <CardDescription>Breakdown by topic areas</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Topics</option>
                  <option value="high">High Progress (≥70%)</option>
                  <option value="low">Low Progress (&lt;50%)</option>
                  <option value="completed">Completed (100%)</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTopics.length > 0 ? (
              <div className="space-y-6">
                <div id="pdf-topic-chart" className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="progress" fill={COLORS.primary} name="Progress %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {filteredTopics.map((topic, index) => (
                    <motion.div
                      key={topic.topic}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-full sm:w-48 font-medium text-gray-900">{topic.topic}</div>
                        <div className="flex-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${topic.progress}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          >
                            <Progress value={topic.progress} className="h-3" />
                          </motion.div>
                          <p className="text-sm text-gray-600 mt-1">
                            {topic.completed} / {topic.total} ({topic.progress.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No topics found for the selected filter.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Test Trends with Line Chart */}
      {testResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Weekly Test Score Trends
              </CardTitle>
              <CardDescription>Your performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="pdf-test-chart" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      name="Score %"
                      dot={{ fill: COLORS.primary, r: 4 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testResults.map((test, index) => (
                      <tr key={test.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {test.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Badge
                            variant={
                              test.score >= 80
                                ? 'default'
                                : test.score >= 60
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {test.score}%
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {test.correctAnswers || 0} / {test.totalQuestions || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{test.dateString}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements & Badges
              </CardTitle>
              <CardDescription>Unlock your potential, one badge at a time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                    >
                      <div
                        className="rounded-full p-3 mb-2"
                        style={{ backgroundColor: `${achievement.color}20` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: achievement.color }} />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 text-center">{achievement.name}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Difficulty-wise Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Difficulty-wise Performance
            </CardTitle>
            <CardDescription>Your progress across different difficulty levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RadarChart data={difficultyData} dataKey="value" color={COLORS.primary} name="Completion %" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Streak Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Activity Heatmap
                </CardTitle>
                <CardDescription>Your daily learning activity over the last {heatmapRange} days</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {[30, 60].map((range) => (
                  <button
                    key={range}
                    onClick={() => setHeatmapRange(range)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border ${
                      heatmapRange === range
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    Last {range}d
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StreakHeatmap data={streakHeatmapData} range={heatmapRange} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Smart Insights
              </CardTitle>
              <CardDescription>Personalized recommendations based on your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'success'
                          ? 'bg-gray-100 dark:bg-neutral-800 border-gray-900 dark:border-white'
                          : insight.type === 'warning'
                          ? 'bg-gray-100 dark:bg-neutral-800 border-gray-700 dark:border-gray-300'
                          : 'bg-gray-100 dark:bg-neutral-800 border-gray-600 dark:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="rounded-full p-2 bg-gray-200 dark:bg-neutral-700"
                        >
                          <Icon
                            className="h-5 w-5 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{insight.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Comparison Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparison Analytics
            </CardTitle>
            <CardDescription>Last 7 days vs Previous 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last 7 Days</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{comparisonData.last7Days}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Activities</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Previous 7 Days</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{comparisonData.previous7Days}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Activities</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Change</p>
                <div className="flex items-center justify-center gap-2">
                  {comparisonData.trend === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-gray-900 dark:text-white" />
                  ) : comparisonData.trend === 'down' ? (
                    <TrendingDown className="h-5 w-5 text-gray-900 dark:text-white" />
                  ) : null}
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {comparisonData.change > 0 ? '+' : ''}
                    {comparisonData.change}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {comparisonData.changePercent}% {comparisonData.trend === 'up' ? 'increase' : comparisonData.trend === 'down' ? 'decrease' : 'change'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity Timeline */}
      {recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={recentActivity} />
            </CardContent>
          </Card>
        </motion.div>
      )}
      </div>
    </div>
  );
};

export default ProgressPage;
