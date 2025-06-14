import React, { useState, useEffect, useRef } from 'react';
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
      <label className="block text-sm font-medium mb-1">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg flex justify-between items-center hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-gray-700">{value === '' ? `Select ${label}` : value}</span>
        <FaChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading questions and tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchQuestions}>
            <FaSync className="mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  // Badge components moved inline
const DifficultyBadge = ({ difficulty }) => {
  const getDifficultyStyles = () => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded text-sm ${getDifficultyStyles()}`}>
      {difficulty}
    </span>
  );
};

const TopicBadge = ({ topic }) => {
  const topicColors = {
    'arrays': 'bg-blue-100 text-blue-800',
    'linkedlists': 'bg-purple-100 text-purple-800',
    'trees': 'bg-green-100 text-green-800',
    'graphs': 'bg-red-100 text-red-800',
    'dynamic programming': 'bg-yellow-100 text-yellow-800',
    'strings': 'bg-indigo-100 text-indigo-800',
    'sorting': 'bg-pink-100 text-pink-800',
    'searching': 'bg-orange-100 text-orange-800'
  };

  const colorClass = topicColors[topic.toLowerCase()] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
      {topic}
    </span>
  );
};

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage DSA Practice Questions</h1>
        <div className="flex items-center gap-4">
          <Button onClick={fetchQuestions} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6 mb-8 shadow-lg overflow-visible">
            <h2 className="text-2xl font-semibold mb-4">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Question title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
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
                <label className="block text-sm font-medium mb-1">Source URL</label>
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
                <label className="block text-sm font-medium mb-1">Hints</label>
                {formData.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={hint}
                      onChange={(e) => handleHintChange(index, e.target.value)}
                      placeholder={`Hint ${index + 1}`}
                    />
                    <Button
                      type="button"
                      onClick={() => removeHint(index)}
                      variant="outline"
                      className="px-2"
                    >
                      <FaTimes />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addHint}
                  variant="outline"
                  className="w-full mt-2"
                >
                  <FaPlus className="mr-2" /> Add Hint
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Solution</label>
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
                <Button type="submit" className="flex-1">
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </Button>
                {editingQuestion && (
                  <Button
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
                    variant="outline"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-4">
            {questionsToDisplay.length > 0 ? (
              questionsToDisplay.map((question) => (
                <Card key={question._id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{question.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                          {question.source}
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm">
                          Order: {question.sheetOrder}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(question)}
                        variant="outline"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(question._id)}
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a
                      href={question.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View on {question.source}
                    </a>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No questions found for the selected sheet/topic.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePracticeQuestions;

