import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, Button, Input, Textarea, Select, toast } from '@/components/ui';
import { FaPlus, FaTrash, FaSync, FaLink, FaExternalLinkAlt, FaCheck, FaTimes, FaEdit, FaChevronDown } from 'react-icons/fa';
// import { DifficultyBadge, TopicBadge } from '@/components/badges';

// Custom Dropdown Component (copied from PracticeQuestions.jsx)
const CustomDropdown = ({ label, value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative custom-dropdown ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">{label}</label>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg flex justify-between items-center hover:border-gray-400 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-neutral-600 transition-colors"
      >
        <span className="text-gray-700 dark:text-gray-300">{value === '' ? `Select ${label}` : value}</span>
        <FaChevronDown className={`transform transition-transform text-gray-700 dark:text-gray-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg dark:shadow-black/50 max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors ${
                value === option.value ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ManagePracticeQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([
    'Array', 'Matrix', 'String', 'Searching & Sorting', 'Linked List',
    'Binary Trees', 'Binary Search Trees', 'Greedy', 'Backtracking',
    'Stacks & Queues', 'Heap', 'Graph', 'Trie', 'Dynamic Programming', 'Bit Manipulation'
  ]);
  const [availableDifficulties, setAvailableDifficulties] = useState(['easy', 'medium', 'hard']);
  const [availableSources, setAvailableSources] = useState(['leetcode', 'codingninjas', 'codechef', 'geeksforgeeks', 'hackerrank', 'hackerearth', 'spoj', 'codeforces', 'other']);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    source: 'leetcode',
    sourceUrl: '',
    hints: [''],
    solution: '',
    sheet: 'Love Babbar',
    sheetTopic: '',
    sheetOrder: 0
  });
  const [fetchUrl, setFetchUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [trackingData, setTrackingData] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(true);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/practice-questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        'http://localhost:5000/api/practice-questions/tracking/questions',
        { headers }
      );
      setCompletedQuestions(new Set(response.data.map(q => q.questionId)));
    } catch (error) {
      console.error('Failed to fetch tracking data:', error);
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchTrackingData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTopicChange = (topic) => {
    setFormData(prev => ({ ...prev, sheetTopic: topic }));
  };

  const handleHintChange = (index, value) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  const addHint = () => {
    setFormData(prev => ({ ...prev, hints: [...prev.hints, ''] }));
  };

  const removeHint = (index) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const dataToSubmit = { ...formData };

      if (editingQuestion) {
        await axios.put(
          `http://localhost:5000/api/practice-questions/${editingQuestion._id}`,
          dataToSubmit,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success('Question updated successfully!');
      } else {
        await axios.post(
          'http://localhost:5000/api/practice-questions',
          dataToSubmit,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success('Question added successfully!');
      }
      setFormData({
        title: '',
        description: '',
        difficulty: 'easy',
        source: 'leetcode',
        sourceUrl: '',
        hints: [''],
        solution: '',
        sheet: 'Love Babbar',
        sheetTopic: '',
        sheetOrder: 0
      });
      setEditingQuestion(null);
      fetchQuestions();
      fetchTrackingData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      source: question.source,
      sourceUrl: question.sourceUrl,
      hints: question.hints.length ? question.hints : [''],
      solution: question.solution,
      sheet: question.sheet || 'Love Babbar',
      sheetTopic: question.sheetTopic,
      sheetOrder: question.sheetOrder || 0
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/practice-questions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Question deleted successfully!');
      fetchQuestions();
      fetchTrackingData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete question');
    }
  };

  const handleFetchQuestion = async () => {
    if (!fetchUrl) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/practice-questions/fetch',
        { url: fetchUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { title, description, difficulty, topic } = response.data;
      setFormData(prev => ({
        ...prev,
        title,
        description,
        difficulty,
        sheetTopic: topic,
        sourceUrl: fetchUrl
      }));
      toast.success('Question details fetched successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch question details');
    } finally {
      setFetching(false);
    }
  };

  const questionsToDisplay = questions.filter(q => 
    q.sheet === formData.sheet && 
    (formData.sheetTopic === '' || q.sheetTopic === formData.sheetTopic)
  ).sort((a, b) => a.sheetOrder - b.sheetOrder);

  if (loading || trackingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading questions and tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchQuestions}>
            <FaSync className="mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  // Badge components moved inline
const DifficultyBadge = ({ difficulty }) => {
  return (
    <span className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">
      {difficulty}
    </span>
  );
};

const TopicBadge = ({ topic }) => {
  return (
    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">
      {topic}
    </span>
  );
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Add padding-top to account for fixed navbar */}
      <div className="container mx-auto p-6 pt-24 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-1">Admin</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage DSA Practice Questions</h1>
          </div>
        <div className="flex items-center gap-4">
          <motion.button 
            onClick={fetchQuestions}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm"
          >
            Refresh
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
          <Card className="p-6 mb-8 shadow-lg overflow-visible bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Question title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Question description"
                  required
                  rows={4}
                />
              </div>

              <div>
                <CustomDropdown
                  label="Difficulty"
                  value={formData.difficulty}
                  onChange={(value) => handleInputChange({ target: { name: 'difficulty', value } })}
                  options={[
                    { value: '', label: 'Select Difficulty' },
                    ...availableDifficulties.map(d => ({ value: d, label: d }))
                  ]}
                />
              </div>

              <div>
                <CustomDropdown
                  label="Source"
                  value={formData.source}
                  onChange={(value) => handleInputChange({ target: { name: 'source', value } })}
                  options={[
                    { value: '', label: 'Select Source' },
                    ...availableSources.map(s => ({ value: s, label: s }))
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Source URL</label>
                <Input
                  name="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={handleInputChange}
                  placeholder="https://leetcode.com/problems/..."
                  required
                />
              </div>

              <div>
                <CustomDropdown
                  label="Topic"
                  value={formData.sheetTopic}
                  onChange={(value) => handleTopicChange(value)}
                  options={[
                    { value: '', label: 'Select a Topic' },
                    ...availableTopics.map(topic => ({ value: topic, label: topic }))
                  ]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Hints</label>
                {formData.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={hint}
                      onChange={(e) => handleHintChange(index, e.target.value)}
                      placeholder={`Hint ${index + 1}`}
                    />
                    <motion.button
                      type="button"
                      onClick={() => removeHint(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-2 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700"
                    >
                      <FaTimes />
                    </motion.button>
                  </div>
                ))}
                <motion.button
                  type="button"
                  onClick={addHint}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2 px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm flex items-center justify-center"
                >
                  <FaPlus className="mr-2" /> Add Hint
                </motion.button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Solution</label>
                <Textarea
                  name="solution"
                  value={formData.solution}
                  onChange={handleInputChange}
                  placeholder="Solution code or explanation"
                  required
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm font-medium"
                >
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </motion.button>
                {editingQuestion && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      setEditingQuestion(null);
                      setFormData({
                        title: '',
                        description: '',
                        difficulty: 'easy',
                        source: 'leetcode',
                        sourceUrl: '',
                        hints: [''],
                        solution: '',
                        sheet: 'Love Babbar',
                        sheetTopic: '',
                        sheetOrder: 0
                      });
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm"
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </form>
          </Card>
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            {questionsToDisplay.length > 0 ? (
              questionsToDisplay.map((question, index) => (
                <motion.div
                  key={question._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                <Card className="p-4 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm min-h-[120px] flex flex-col">
                  <div className="flex justify-between items-start flex-1">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{question.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-sm">
                          {question.source}
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-sm">
                          Order: {question.sheetOrder}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <motion.button
                        onClick={() => handleEdit(question)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700"
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(question._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded transition-colors bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-300 dark:border-neutral-700"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
                    <a
                      href={question.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline text-sm transition-colors"
                    >
                      View on {question.source}
                    </a>
                  </div>
                </Card>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No questions found for the selected sheet/topic.</p>
            )}
          </motion.div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default ManagePracticeQuestions;

