import React, { useState, useEffect } from 'react';
import { Card, Button, Select } from '@/components/ui';
import { FaExternalLinkAlt, FaCheck, FaTimes, FaSync, FaBookmark, FaSearch, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';

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
      <label className="block text-sm font-medium mb-1">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg flex justify-between items-center hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-gray-700">{value === 'all' ? `All ${label}s` : value}</span>
        <FaChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-[999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-blue-50 ${
                value === option.value ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
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
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchQuestions}><FaSync className="mr-2" /> Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">DSA Practice Questions</h1>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4 mb-8 overflow-visible">
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
      
      {/* Questions List */}
      <div className="space-y-8">
        {searchFilteredQuestions.map(topic => (
          <div key={topic.topic} className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{topic.topic}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topic.questions.map((question, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg pr-2">{question.question}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBookmark(question.url)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          bookmarkedQuestions.includes(question.url)
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={bookmarkedQuestions.includes(question.url) ? 'Remove Bookmark' : 'Add Bookmark'}
                      >
                        <FaBookmark />
                      </button>
                      <button
                        onClick={() => handleComplete(question.url)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          completedQuestions.includes(question.url)
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={completedQuestions.includes(question.url) ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        {completedQuestions.includes(question.url) ? <FaCheck /> : <FaTimes />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      Question {index + 1}
                    </span>
                    {completedQuestions.includes(question.url) && (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        Completed
                      </span>
                    )}
                    {bookmarkedQuestions.includes(question.url) && (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                        Bookmarked
                      </span>
                    )}
                  </div>
                  <a
                    href={question.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline text-sm"
                  >
                    Solve Problem <FaExternalLinkAlt className="ml-1" size={10} />
                  </a>
                </Card>
              ))}
            </div>
          </div>
        ))}
        {searchFilteredQuestions.length === 0 && (
          <Card className="p-6 text-center text-gray-500">
            No questions found matching your filters.
          </Card>
        )}
      </div>
    </div>
  );
};

export default PracticeQuestions;