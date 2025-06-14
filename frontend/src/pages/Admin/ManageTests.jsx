import React, { useState, useEffect } from 'react';
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading tests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <Button onClick={fetchData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Tests</h1>
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Test</h2>
          <form onSubmit={handleAddTest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Test Title</label>
                <Input
                  value={newTest.title}
                  onChange={(e) => setNewTest(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter test title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
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
                <label className="block text-sm font-medium mb-1">Week Number</label>
                <Input
                  type="number"
                  value={newTest.weekNumber}
                  onChange={(e) => setNewTest(prev => ({ ...prev, weekNumber: e.target.value }))}
                  placeholder="Enter week number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
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
                <div key={qIndex} className="p-4 border rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Question {qIndex + 1}</label>
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
                        <label className="block text-sm font-medium mb-1">Option {oIndex + 1}</label>
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
                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
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
                </div>
              ))}
              <Button type="button" onClick={handleAddQuestion} variant="outline">
                Add Question
              </Button>
            </div>

            <Button type="submit">Add Test</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Tests</h2>
          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test._id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{test.title}</h3>
                    <p className="text-sm text-gray-600">Week {test.weekNumber}</p>
                    <p className="text-sm text-gray-600">
                      Topic: {topics.find(t => t._id === test.topic)?.title || 'Unknown Topic'}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteTest(test._id)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="space-y-2">
                  {test.questions.map((question, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium">Q{index + 1}: {question.question}</p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={`p-2 rounded ${
                              oIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageTests;
