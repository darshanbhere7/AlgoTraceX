import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Timer } from 'lucide-react';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [scores, setScores] = useState(() => {
    const savedScores = localStorage.getItem('testScores');
    return savedScores ? JSON.parse(savedScores) : {};
  });

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tests/public', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setTests(response.data);
    } catch (error) {
      console.error('Failed to fetch tests:', error, error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load tests. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleStartTest = (test) => {
    console.log('handleStartTest called with test:', test);
    if (!localStorage.getItem('token')) {
      toast.error('Please login to start the test');
      return;
    }
    setSelectedTest(test);
    setAnswers({});
    // Force timeLeft to 1 minute (60 seconds) for debugging and consistent behavior as requested.
    setTimeLeft(60); 
    setStartTime(Date.now());
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleSubmitTest = useCallback(async () => {
    if (submitting) return; // Prevent multiple submissions
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to submit the test');
      }

      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds

      const response = await axios.post(
        'http://localhost:5000/api/tests/submit',
        {
          testId: selectedTest._id,
          answers: Object.entries(answers).map(([questionIndex, answer]) => ({
            questionIndex: parseInt(questionIndex),
            answer: parseInt(answer)
          })),
          timeSpent
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Save score to localStorage
      const newScores = {
        ...scores,
        [selectedTest._id]: {
          score: response.data.score,
          timeSpent: response.data.timeSpent,
          date: new Date().toISOString(),
          totalQuestions: response.data.totalQuestions,
          correctAnswers: response.data.correctAnswers
        }
      };
      setScores(newScores);
      localStorage.setItem('testScores', JSON.stringify(newScores));

      // Show detailed success message
      toast.success(
        `Test completed! Score: ${response.data.score}% (${response.data.correctAnswers}/${response.data.totalQuestions} correct)`,
        {
          duration: 5000,
          description: `Time taken: ${formatTime(response.data.timeSpent)}`
        }
      );

      setSelectedTest(null);
      setAnswers({});
      setTimeLeft(null);
      setStartTime(null);
    } catch (error) {
      console.error('Failed to submit test:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, {
        duration: 5000,
        description: error.response?.data?.error || 'Please try again'
      });
      
      // Special handling for test already submitted
      if (error.response?.data?.message?.includes('already submitted')) {
        const newScores = {
          ...scores,
          [selectedTest._id]: {
            score: 0, // Placeholder, as we don't have the actual score for already submitted
            timeSpent: 0,
            date: new Date().toISOString()
          }
        };
        setScores(newScores);
        localStorage.setItem('testScores', JSON.stringify(newScores));
        setSelectedTest(null);
        setAnswers({});
        setTimeLeft(null);
        setStartTime(null);
      }
    } finally {
      setSubmitting(false);
    }
  }, [selectedTest, answers, startTime, scores, submitting]);

  // Timer effect
  useEffect(() => {
    let timerInterval;
    if (selectedTest) {
      // Only initialize timeLeft if it's null (first time starting test or returning to test)
      if (timeLeft === null) {
        setTimeLeft(60); // Force to 1 minute (60 seconds) as requested
      }

      timerInterval = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 1) {
            clearInterval(timerInterval);
            handleSubmitTest(); // Automatically submit when time runs out
            return 0;
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
    } else {
      // Clear timeLeft when no test is selected (e.g., user goes back to test list)
      setTimeLeft(null);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [selectedTest, handleSubmitTest, timeLeft]); // Add timeLeft to dependencies to trigger re-run when it's set

  // Format time display
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        <Button onClick={fetchTests} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (selectedTest) {
    console.log('Rendering selected test view. selectedTest:', selectedTest);
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="mb-6" key={selectedTest._id}> {/* Added key for robust re-rendering */}
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{selectedTest.title}</h1>
                <p className="text-gray-600 mt-2">Week {selectedTest.weekNumber}</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Timer Display */}
                {console.log('Rendering Timer. timeLeft:', timeLeft, 'Type:', typeof timeLeft)} {/* Added console log for debugging */}
                {typeof timeLeft === 'number' && ( // Only show timer if timeLeft is a number
                  <div className={`flex items-center gap-2 text-lg font-semibold px-4 py-2 rounded-lg ${timeLeft <= 10 ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                    <Timer className="h-5 w-5" />
                    <span className={timeLeft <= 10 ? 'font-bold' : ''}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
                <Button onClick={() => setSelectedTest(null)} variant="outline">
                  Back to Tests
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedTest.questions.map((question, qIndex) => (
            <Card key={qIndex}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Question {qIndex + 1}: {question.question}
                </h3>
                <RadioGroup
                  value={answers[qIndex]?.toString()}
                  onValueChange={(value) => handleAnswerChange(qIndex, value)}
                  className="space-y-3"
                >
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end space-x-4">
            <Button onClick={() => setSelectedTest(null)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitTest}
              disabled={submitting || Object.keys(answers).length !== selectedTest.questions.length}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {console.log('Tests component is rendering.')}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Tests</h1>
        {Object.keys(scores).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-semibold">Your Scores:</span>
            {tests.map(test => scores[test._id] && (
              <div key={test._id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
                <span>{test.title}</span>
                <span className="font-bold">{scores[test._id].score}%</span>
                <span className="text-sm">({formatTime(scores[test._id].timeSpent)})</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <Card key={test._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">{test.title}</h3>
              <p className="text-gray-600 mb-4">Week {test.weekNumber}</p>
              <p className="text-gray-600 mb-4">{test.questions.length} questions</p>
              <p className="text-gray-600 mb-4">Time Limit: {test.timeLimit} minutes</p>
              {scores[test._id] && (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-green-700 font-semibold">
                    Score: {scores[test._id].score}%
                  </p>
                  <p className="text-green-600 text-sm">
                    Correct Answers: {scores[test._id].correctAnswers}/{scores[test._id].totalQuestions}
                  </p>
                  <p className="text-green-600 text-sm">
                    Time Taken: {formatTime(scores[test._id].timeSpent)}
                  </p>
                  <p className="text-green-600 text-sm">
                    Date: {new Date(scores[test._id].date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {console.log(`Test ID: ${test._id}, Scores[test._id]:`, scores[test._id], `Button disabled: ${scores[test._id] !== undefined}`)}
              <Button 
                onClick={() => handleStartTest(test)}
                className="w-full"
                disabled={scores[test._id] !== undefined}
              >
                {scores[test._id] ? 'Test Completed' : 'Start Test'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tests; 