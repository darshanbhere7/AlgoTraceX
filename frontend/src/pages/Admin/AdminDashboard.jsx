import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load dashboard data. Please try again.');
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

  // Check for dark mode preference (for chart colors)
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-neutral-950 text-gray-900 dark:text-white">
        <div className="text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-neutral-950 text-gray-900 dark:text-white">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-neutral-950 text-gray-900 dark:text-white">
        <div className="text-xl">No data available</div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
          </div>
          <motion.button 
            onClick={fetchAnalytics}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm"
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
            className="rounded-lg p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">
              Total Users
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics.totalUsers}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">
              Total Tests
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics.totalTests}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">
              Active Users
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics.activeUsers || 0}
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            User Signups (Last 7 Days)
          </h2>
          <div className="rounded-lg p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.weeklySignups}>
                  <XAxis 
                    dataKey="date" 
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <YAxis 
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#171717' : '#ffffff',
                      border: darkMode ? '1px solid #404040' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                    labelStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
                  />
                  <Bar dataKey="count" fill={darkMode ? '#525252' : '#737373'} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {analytics.recentFeedbacks && analytics.recentFeedbacks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Recent Feedback
            </h2>
            <div className="space-y-4">
              {analytics.recentFeedbacks.map((feedback, index) => (
                <div 
                  key={index}
                  className="rounded-lg p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300">
                        {feedback.message}
                      </p>
                      <p className="text-sm mt-2 text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {feedback.rating && (
                      <div className="flex items-center ml-4">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 text-gray-900 dark:text-white">
                          {feedback.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
        </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;