import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ManageTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    difficulty: 'beginner'
  });
  const [error, setError] = useState(null);

    const fetchTopics = async () => {
      try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/admin/topics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
        setTopics(response.data);
      } catch (error) {
      console.error('Failed to fetch topics:', error);
      setError('Failed to load topics. Please try again.');
      toast.error('Failed to load topics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchTopics();
    // Set up polling for real-time updates
    const interval = setInterval(fetchTopics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/topics',
        newTopic,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setTopics([...topics, response.data]);
      setNewTopic({ title: '', description: '', difficulty: 'beginner' });
      toast.success('Topic added successfully!');
    } catch (error) {
      console.error('Failed to add topic:', error);
      toast.error('Failed to add topic. Please try again.');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/topics/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTopics(topics.filter(topic => topic._id !== topicId));
      toast.success('Topic deleted successfully!');
    } catch (error) {
      console.error('Failed to delete topic:', error);
      toast.error('Failed to delete topic. Please try again.');
    }
  };

  if (loading && topics.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading topics...</div>
      </div>
    );
  }

  if (error && topics.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Topics</h1>
        <motion.button 
          onClick={fetchTopics}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 transition-colors shadow-sm"
        >
          Refresh Topics
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
      <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Topic</h2>
          <form onSubmit={handleAddTopic} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Title</label>
              <Input
                type="text"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                placeholder="Enter topic title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Description</label>
              <Textarea
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                placeholder={`Input: An array A of size n. A target value key

Output: Index of the key if found, otherwise -1

🔸 Algorithm:
LinearSearch(A, n, key)
1. for i ← 0 to n - 1 do
2.     if A[i] = key then
3.         return i
4. return -1`}
                className="font-mono"
                rows={10}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Use the format above with Input, Output, and Algorithm sections. Use monospace font for better readability.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Difficulty</label>
              <select
                value={newTopic.difficulty}
                onChange={(e) => setNewTopic({ ...newTopic, difficulty: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm font-medium"
            >
              Add Topic
            </motion.button>
          </form>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
      <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Available Topics</h2>
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <motion.div 
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{topic.title}</h3>
                  <pre className="text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap mt-2">{topic.description}</pre>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-300 mt-2 inline-block">
                    {topic.difficulty}
                  </span>
                </div>
                <motion.button
                  onClick={() => handleDeleteTopic(topic._id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-4 px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-300 dark:border-neutral-700 shadow-sm"
                >
                  Delete
                </motion.button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>
      </div>
    </div>
  );
};

export default ManageTopics;
