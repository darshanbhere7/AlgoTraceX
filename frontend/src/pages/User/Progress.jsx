import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Progress } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { FaSync } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all practice questions
        const questionsResponse = await axios.get('http://localhost:5000/api/questions');
        setAllQuestions(questionsResponse.data);

        // Fetch user's completed questions
        const trackingResponse = await axios.get(
          'http://localhost:5000/api/practice-questions/tracking/questions',
          { headers }
        );
        setCompletedQuestions(new Set(trackingResponse.data.map(q => q.questionId)));

        // Fetch test results from localStorage
        const savedScores = localStorage.getItem('testScores');
        if (savedScores) {
          const parsedScores = JSON.parse(savedScores);
          // Convert the scores object into an array for easier mapping in JSX
          const formattedTestResults = Object.keys(parsedScores).map(testId => ({
            name: `Test ${testId.substring(0, 8)}...`, // You might want to get actual test names from a test API if available
            score: parsedScores[testId].score,
            date: new Date(parsedScores[testId].date).toLocaleDateString(),
          }));
          setTestResults(formattedTestResults);
        }

      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Overall Progress
  const totalQuestions = allQuestions.reduce((acc, topic) => acc + topic.questions.length, 0);
  const completedCount = completedQuestions.size;
  const overallProgress = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;

  // Calculate Topic-wise Progress
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-lg">Loading Progress...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => window.location.reload()} className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700">
              <FaSync className="mr-2" /> Retry
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="p-6 pt-24 pb-12 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Your Learning Progress</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your DSA learning journey</p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4 }}
        >
          <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Overall DSA Progress</h2>
            <div className="flex items-center space-x-4">
              <div className="text-5xl font-bold text-gray-900 dark:text-white">{overallProgress.toFixed(1)}%</div>
              <div className="flex-1">
                <Progress value={overallProgress} className="h-4 bg-gray-200 dark:bg-neutral-800" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{completedCount} of {totalQuestions} questions completed</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Topic-wise Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4 }}
        >
          <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Topic-wise Progress</h2>
            <div className="space-y-4">
              {topicProgress.length > 0 ? (
                topicProgress.map((topic, index) => (
                  <motion.div
                    key={topic.topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-32 font-medium text-gray-900 dark:text-white">{topic.topic}</div>
                    <div className="flex-1">
                      <Progress value={topic.progress} className="h-3 bg-gray-200 dark:bg-neutral-800" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{topic.completed} / {topic.total} ({topic.progress}%)</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No topics with questions found.</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Weekly Test Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ y: -4 }}
        >
          <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Weekly Test Results</h2>
            {testResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                  <thead className="bg-gray-50 dark:bg-neutral-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
                    {testResults.map((test, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{test.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{test.score}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{test.date}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No test results available yet.</p>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressPage;