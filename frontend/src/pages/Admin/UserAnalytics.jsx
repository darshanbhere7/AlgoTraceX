import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { buildApiUrl } from '@/config/api';
import { useTheme } from '../../context/ThemeContext.jsx';

const UserAnalytics = () => {
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(buildApiUrl('/admin/analytics'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data. Please try again.');
      toast.error('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Set up polling for real-time updates
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading analytics data...</div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-xl text-gray-600 dark:text-gray-400">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Add padding-top to account for fixed navbar */}
      <div className="p-6 pt-24 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-1">Admin</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Analytics</h1>
          </div>
        <motion.button 
          onClick={fetchAnalytics}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 transition-colors shadow-sm"
        >
          Refresh Data
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
        <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Total Users</h2>
            <p className="text-2xl text-gray-900 dark:text-white">{analytics.totalUsers}</p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
        <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tests Taken</h2>
            <p className="text-2xl text-gray-900 dark:text-white">{analytics.totalTestsTaken}</p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
        <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Average Score</h2>
            <p className="text-2xl text-gray-900 dark:text-white">{analytics.averageScore}%</p>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">User Signups (Last 7 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.weeklySignups}>
                  <XAxis 
                    dataKey="date" 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                  />
                  <YAxis 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#171717' : '#ffffff',
                      border: isDark ? '1px solid #404040' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    labelStyle={{ color: isDark ? '#ffffff' : '#000000' }}
                  />
                  <Bar dataKey="count" fill={isDark ? '#525252' : '#737373'} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Average Test Scores</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.testScores}>
                  <XAxis 
                    dataKey="date" 
                      stroke={isDark ? '#9ca3af' : '#6b7280'}
                      tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                      stroke={isDark ? '#9ca3af' : '#6b7280'}
                      tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#171717' : '#ffffff',
                      border: isDark ? '1px solid #404040' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    labelStyle={{ color: isDark ? '#ffffff' : '#000000' }}
                  />
                  <Line type="monotone" dataKey="score" stroke={isDark ? '#525252' : '#737373'} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
      <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Topic-wise Progress</h2>
          <div className="space-y-4">
            {analytics.topicProgress && Object.entries(analytics.topicProgress).map(([topic, progress]) => (
              <div key={topic} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium capitalize text-gray-900 dark:text-white">{topic}</span>
                  <span className="text-gray-900 dark:text-white">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gray-500 dark:bg-gray-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {analytics.recentActivity && analytics.recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
        <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      )}
      </div>
    </div>
  );
};

export default UserAnalytics;
