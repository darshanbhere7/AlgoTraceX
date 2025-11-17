import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ManageTests = () => {
  const [tests, setTests] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTest, setNewTest] = useState({
    title: '',
    topic: '',
    weekNumber: '',
    timeLimit: 10, // Default time limit in minutes
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const [testsResponse, topicsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/tests', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/admin/topics', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setTests(testsResponse.data);
      setTopics(topicsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load data. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddQuestion = () => {
    setNewTest(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setNewTest(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setNewTest(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: q.options.map((opt, j) => j === optionIndex ? value : opt)
        } : q
      )
    }));
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate time limit
      if (newTest.timeLimit < 1) {
        toast.error('Time limit must be at least 1 minute');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/tests',
        newTest,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setTests(prev => [...prev, response.data]);
      setNewTest({
        title: '',
        topic: '',
        weekNumber: '',
        timeLimit: 10,
        questions: [
          {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0
          }
        ]
      });
      toast.success('Test added successfully!');
    } catch (error) {
      console.error('Failed to add test:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add test. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTest = async (testId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`http://localhost:5000/api/tests/${testId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTests(prev => prev.filter(test => test._id !== testId));
      toast.success('Test deleted successfully!');
    } catch (error) {
      console.error('Failed to delete test:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete test. Please try again.';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading tests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</div>
        <Button onClick={fetchData} variant="outline">
          Try Again
        </Button>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Tests</h1>
        <motion.button 
          onClick={fetchData}
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
      >
      <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Test</h2>
          <form onSubmit={handleAddTest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Test Title</label>
                <Input
                  value={newTest.title}
                  onChange={(e) => setNewTest(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter test title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Topic</label>
                <Select
                  value={newTest.topic}
                  onValueChange={(value) => setNewTest(prev => ({ ...prev, topic: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map(topic => (
                      <SelectItem key={topic._id} value={topic._id}>
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Week Number</label>
                <Input
                  type="number"
                  value={newTest.weekNumber}
                  onChange={(e) => setNewTest(prev => ({ ...prev, weekNumber: e.target.value }))}
                  placeholder="Enter week number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Time Limit (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  value={newTest.timeLimit}
                  onChange={(e) => setNewTest(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 10 }))}
                  placeholder="Enter time limit"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              {newTest.questions.map((question, qIndex) => (
                <motion.div 
                  key={qIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: qIndex * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg space-y-4 bg-white dark:bg-neutral-900"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Question {qIndex + 1}</label>
                    <Input
                      value={question.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      placeholder="Enter question"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex}>
                        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Option {oIndex + 1}</label>
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Enter option ${oIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Correct Answer</label>
                    <Select
                      value={question.correctAnswer.toString()}
                      onValueChange={(value) => handleQuestionChange(qIndex, 'correctAnswer', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Option {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              ))}
              <motion.button 
                type="button" 
                onClick={handleAddQuestion}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm"
              >
                Add Question
              </motion.button>
            </div>

            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm font-medium"
            >
              Add Test
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
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Available Tests</h2>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <motion.div 
                key={test._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{test.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Week {test.weekNumber}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Topic: {topics.find(t => t._id === test.topic)?.title || 'Unknown Topic'}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => handleDeleteTest(test._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-300 dark:border-neutral-700 shadow-sm"
                  >
                    Delete
                  </motion.button>
                </div>
                <div className="space-y-2">
                  {test.questions.map((question, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-neutral-800 rounded">
                      <p className="font-medium text-gray-900 dark:text-white">Q{index + 1}: {question.question}</p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={`p-2 rounded ${
                              oIndex === question.correctAnswer
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-gray-300'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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

export default ManageTests;
