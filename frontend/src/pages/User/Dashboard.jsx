import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Progress } from '@/components/ui';
import { FaSync, FaChartLine, FaCode, FaLightbulb, FaTrophy, FaCheckCircle, FaBook } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import Aurora from '../../components/Aurora';

const Dashboard = () => {
  const { user, loading: userLoading } = useAuth();
  const [overallLoading, setOverallLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setOverallLoading(false);
        return;
      }

      setOverallLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const questionsResponse = await axios.get('http://localhost:5000/api/questions');
        setAllQuestions(questionsResponse.data);

        const trackingResponse = await axios.get(
          'http://localhost:5000/api/practice-questions/tracking/questions',
          { headers }
        );
        setCompletedQuestions(new Set(trackingResponse.data.map(q => q.questionId)));

        const savedScores = localStorage.getItem('testScores');
        if (savedScores) {
          const parsedScores = JSON.parse(savedScores);
          const formattedTestResults = Object.keys(parsedScores).map(testId => ({
            name: `Test ${testId.substring(0, 8)}...`,
            score: parsedScores[testId].score,
            date: new Date(parsedScores[testId].date).toLocaleDateString(),
          }));
          setTestResults(formattedTestResults);
        }

      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setOverallLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalQuestions = allQuestions.reduce((acc, topic) => acc + topic.questions.length, 0);
  const completedCount = completedQuestions.size;
  const overallProgress = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;

  const topicProgress = allQuestions.map(topic => {
    const totalTopicQuestions = topic.questions.length;
    const completedTopicQuestions = topic.questions.filter(q => completedQuestions.has(q.url)).length;
    const progress = totalTopicQuestions > 0 ? (completedTopicQuestions / totalTopicQuestions) * 100 : 0;
    return {
      topic: topic.topic,
      completed: completedTopicQuestions,
      total: totalTopicQuestions,
      progress: progress.toFixed(2),
    };
  }).filter(t => t.total > 0);

  // Prepare chart data
  const topicChartData = topicProgress.map(t => ({
    name: t.topic.length > 12 ? t.topic.substring(0, 12) + '...' : t.topic,
    value: parseFloat(t.progress),
    completed: t.completed,
    total: t.total
  }));

  const progressData = [
    { name: 'Progress', value: overallProgress }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (userLoading || overallLoading) {
    return (
      <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
        <Aurora
          colorStops={["#053D70", "#1D0764", "#471494"]}
          blend={1}
          amplitude={2.0}
          speed={0.3}
        />
        <div className="relative z-10 flex justify-center items-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-700 border-t-black dark:border-t-white mx-auto mb-4"></div>
            <p className="text-lg text-gray-800 dark:text-white">Loading Dashboard...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
        <Aurora
          colorStops={["#053D70", "#1D0764", "#471494"]}
          blend={1}
          amplitude={2.0}
          speed={0.3}
        />
        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md shadow-lg"
          >
            <p className="text-gray-800 dark:text-gray-200 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black py-2.5 px-5 rounded-lg transition-all hover:scale-105 shadow-md"
            >
              <FaSync /> Retry
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
        <Aurora
          colorStops={["#053D70", "#1D0764", "#471494"]}
          blend={1}
          amplitude={2.0}
          speed={0.3}
        />
        <div className="relative z-10 flex justify-center items-center min-h-screen">
          <p className="text-gray-800 dark:text-white text-lg">Please login to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
      <Aurora
        colorStops={["#053D70", "#1D0764", "#471494"]}
        blend={1}
        amplitude={2.0}
        speed={0.3}
      />

      <motion.div
        className="relative z-10 container mx-auto px-6 py-12 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-12">
          <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2">
            Welcome back, <span className="font-medium">{user.name}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Here's your learning progress</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <FaCheckCircle className="text-2xl text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
            <p className="text-3xl font-light text-gray-900 dark:text-white">{completedCount}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <FaBook className="text-2xl text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Questions</p>
            <p className="text-3xl font-light text-gray-900 dark:text-white">{totalQuestions}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <FaChartLine className="text-2xl text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
            <p className="text-3xl font-light text-gray-900 dark:text-white">{overallProgress.toFixed(1)}%</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <FaTrophy className="text-2xl text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tests Taken</p>
            <p className="text-3xl font-light text-gray-900 dark:text-white">{testResults.length}</p>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Overall Progress */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Overall Progress</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-800"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className="text-black dark:text-white"
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * overallProgress) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ strokeDasharray: 440 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-light text-gray-900 dark:text-white">
                    {overallProgress.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="text-gray-900 dark:text-white">{completedCount} / {totalQuestions}</span>
              </div>
            </div>
            <Link
              to="/user/progress"
              className="block w-full text-center bg-black dark:bg-white text-white dark:text-black py-3 px-4 rounded-xl transition-all hover:scale-105 shadow-sm text-sm font-medium"
            >
              View Details
            </Link>
          </motion.div>

          {/* User Profile */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center text-4xl font-light text-gray-900 dark:text-white mb-4 shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{user.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
              <span className="inline-block bg-gray-100 dark:bg-gray-900 px-4 py-1.5 rounded-full text-xs font-medium text-gray-900 dark:text-white">
                {user.role}
              </span>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/user/visualizer-home"
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group shadow-sm"
              >
                <FaCode className="text-xl text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Algorithm Visualizer</span>
              </Link>
              <Link
                to="/user/ai-recommendations"
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group shadow-sm"
              >
                <FaLightbulb className="text-xl text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">AI Recommendations</span>
              </Link>
              <Link
                to="/user/weekly-test"
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group shadow-sm"
              >
                <FaTrophy className="text-xl text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Weekly Test</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Topic Progress */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Topic Progress</h3>
            {topicChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    className="text-gray-400 dark:text-gray-600"
                    style={{ fontSize: '11px' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-gray-400 dark:text-gray-600"
                    style={{ fontSize: '11px' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}
                    labelStyle={{ color: '#000', fontWeight: 500 }}
                  />
                  <Bar
                    dataKey="value"
                    fill="currentColor"
                    className="text-black dark:text-white"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-600">
                No data available
              </div>
            )}
          </motion.div>

          {/* Test Performance */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Test Performance</h3>
            {testResults.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={testResults.slice(-6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="currentColor" stopOpacity={0.3} className="text-black dark:text-white" />
                        <stop offset="95%" stopColor="currentColor" stopOpacity={0} className="text-black dark:text-white" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      stroke="currentColor"
                      className="text-gray-400 dark:text-gray-600"
                      style={{ fontSize: '10px' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="currentColor"
                      className="text-gray-400 dark:text-gray-600"
                      style={{ fontSize: '11px' }}
                      domain={[0, 100]}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="currentColor"
                      className="text-black dark:text-white"
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2 max-h-32 overflow-y-auto">
                  {testResults.slice(-3).reverse().map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{test.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{test.date}</p>
                      </div>
                      <span className="text-xl font-light text-gray-900 dark:text-white">
                        {test.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-600">
                No test results yet
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;