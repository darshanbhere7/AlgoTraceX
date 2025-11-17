import React, { useState, useEffect } from 'react';
import { Card, Button, Select } from '@/components/ui';
import { FaExternalLinkAlt, FaCheck, FaTimes, FaSync, FaBookmark, FaSearch, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';

// Custom Dropdown Component
const CustomDropdown = ({ label, value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.custom-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative custom-dropdown ${className}`}>
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg flex justify-between items-center hover:border-gray-400 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white"
      >
        <span>{value === 'all' ? `All ${label}s` : value}</span>
        <FaChevronDown className={`transform transition-transform text-gray-600 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-[999] w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-800 ${
                value === option.value ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
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

const PracticeQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    topic: 'all',
    status: 'all'
  });
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(() => {
    const saved = localStorage.getItem('bookmarkedQuestions');
    return saved ? JSON.parse(saved) : [];
  });
  const [completedQuestions, setCompletedQuestions] = useState(() => {
    const saved = localStorage.getItem('completedQuestions');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique topics from questions
  const topicOptions = [
    { value: 'all', label: 'All Topics' },
    ...questions.map(topic => ({
      value: topic.topic,
      label: topic.topic
    }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'bookmarked', label: 'Bookmarked' }
  ];

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleBookmark = (questionId) => {
    setBookmarkedQuestions(prev => {
      const newBookmarks = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const handleComplete = (questionId) => {
    setCompletedQuestions(prev => {
      const newCompleted = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      localStorage.setItem('completedQuestions', JSON.stringify(newCompleted));
      return newCompleted;
    });
  };

  const filteredQuestions = questions.filter(topic => {
    if (filters.topic !== 'all' && topic.topic !== filters.topic) return false;
    return true;
  });

  const searchFilteredQuestions = filteredQuestions.map(topic => ({
    ...topic,
    questions: topic.questions.filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = 
        filters.status === 'all' ? true :
        filters.status === 'completed' ? completedQuestions.includes(q.url) :
        filters.status === 'pending' ? !completedQuestions.includes(q.url) :
        filters.status === 'bookmarked' ? bookmarkedQuestions.includes(q.url) : true;
      return matchesSearch && matchesStatus;
    })
  })).filter(topic => topic.questions.length > 0);

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
          <p className="text-lg">Loading...</p>
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
            <Button onClick={fetchQuestions} variant="outline" className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700">
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">DSA Practice Questions</h1>
          <p className="text-gray-600 dark:text-gray-400">Practice and master DSA problems</p>
        </motion.div>
      
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
        </motion.div>

        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm p-4 overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomDropdown
            label="Topic"
            value={filters.topic}
            onChange={(value) => handleFilterChange('topic', value)}
            options={topicOptions}
          />
          <CustomDropdown
            label="Status"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            options={statusOptions}
          />
          </div>
        </Card>
        </motion.div>
        
        {/* Questions List */}
        <div className="space-y-8">
          {searchFilteredQuestions.map((topic, topicIndex) => (
            <motion.div
              key={topic.topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + topicIndex * 0.1 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{topic.topic}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topic.questions.map((question, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + topicIndex * 0.1 + index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg pr-2 text-gray-900 dark:text-white">{question.question}</h3>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleBookmark(question.url)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 rounded-full transition-colors duration-200 ${
                              bookmarkedQuestions.includes(question.url)
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                                : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                            }`}
                            title={bookmarkedQuestions.includes(question.url) ? 'Remove Bookmark' : 'Add Bookmark'}
                          >
                            <FaBookmark />
                          </motion.button>
                          <motion.button
                            onClick={() => handleComplete(question.url)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 rounded-full transition-colors duration-200 ${
                              completedQuestions.includes(question.url)
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                            }`}
                            title={completedQuestions.includes(question.url) ? 'Mark as Pending' : 'Mark as Completed'}
                          >
                            {completedQuestions.includes(question.url) ? <FaCheck /> : <FaTimes />}
                          </motion.button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
                          Question {index + 1}
                        </span>
                        {completedQuestions.includes(question.url) && (
                          <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium border border-green-200 dark:border-green-800">
                            Completed
                          </span>
                        )}
                        {bookmarkedQuestions.includes(question.url) && (
                          <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium border border-yellow-200 dark:border-yellow-800">
                            Bookmarked
                          </span>
                        )}
                      </div>
                      <a
                        href={question.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Solve Problem <FaExternalLinkAlt className="ml-1" size={10} />
                      </a>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
          {searchFilteredQuestions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm p-6 text-center text-gray-500 dark:text-gray-400">
                No questions found matching your filters.
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeQuestions;