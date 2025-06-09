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
      
      const [testsResponse, topicsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/tests', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:5000/api/admin/topics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setTests(testsResponse.data);
      setTopics(topicsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again.');
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
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
      const response = await axios.post(
        'http://localhost:5000/api/admin/tests',
        newTest,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setTests(prev => [...prev, response.data]);
      setNewTest({
        title: '',
        topic: '',
        weekNumber: '',
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
      toast.error('Failed to add test. Please try again.');
    }
  };

  const handleDeleteTest = async (testId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/tests/${testId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setTests(prev => prev.filter(test => test._id !== testId));
      toast.success('Test deleted successfully!');
    } catch (error) {
      console.error('Failed to delete test:', error);
      toast.error('Failed to delete test. Please try again.');
    }
  };

  if (loading && !tests.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading tests...</div>
      </div>
    );
  }

  if (error && !tests.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Tests</h1>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Test</h2>
          <form onSubmit={handleAddTest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="w-full"
              >
                Add Another Question
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Add Test
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available Tests</h2>
        {tests.map(test => (
          <Card key={test._id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{test.title}</h3>
                  <p className="text-gray-600">Week {test.weekNumber}</p>
                  <p className="text-gray-600">{test.questions.length} questions</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTest(test._id)}
                >
                  Delete Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageTests;
