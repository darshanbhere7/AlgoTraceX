import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Timer } from 'lucide-react';

const WeeklyTest = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [scores, setScores] = useState(() => {
    const savedScores = localStorage.getItem('testScores');
    return savedScores ? JSON.parse(savedScores) : {};
  });
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const navigate = useNavigate();

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

  // Calculate total score across all tests
  const calculateTotalScore = () => {
    let totalScore = 0;
    let totalTests = 0;
    let totalCorrect = 0;
    let totalQuestions = 0;

    Object.values(scores).forEach(score => {
      totalScore += score.score;
      totalTests++;
      totalCorrect += score.correctAnswers;
      totalQuestions += score.totalQuestions;
    });

    return {
      averageScore: totalTests > 0 ? Math.round(totalScore / totalTests) : 0,
      totalTests,
      totalCorrect,
      totalQuestions
    };
  };

  const totalScoreData = calculateTotalScore();

  const handleStartTest = (test) => {
    console.log('handleStartTest called with test:', test);
    if (!localStorage.getItem('token')) {
      toast.error('Please login to start the test');
      return;
    }
    setSelectedTest(test);
    setAnswers({});
    setTimeLeft(test.timeLimit * 60); // Convert minutes to seconds
    setStartTime(Date.now());
    setAutoSubmitted(false);
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmitTest = useCallback(async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to submit the test');
      }
  
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
  
      // Prepare answers array with default -1 for unanswered questions
      const answersArray = selectedTest.questions.map((_, index) => {
        return answers[index] !== undefined ? parseInt(answers[index]) : -1;
      });
  
      const response = await axios.post(
        'http://localhost:5000/api/tests/submit',
        {
          testId: selectedTest._id,
          answers: answersArray,
          timeSpent
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
  
      const newScores = {
        ...scores,
        [selectedTest._id]: {
          score: response.data.score,
          timeSpent: response.data.timeSpent,
          date: new Date().toISOString(),
          totalQuestions: response.data.totalQuestions,
          correctAnswers: response.data.correctAnswers,
          autoSubmitted
        }
      };
      setScores(newScores);
      localStorage.setItem('testScores', JSON.stringify(newScores));
  
      toast.success(
        `Test ${autoSubmitted ? 'auto-submitted' : 'completed'}! Score: ${response.data.score}% (${response.data.correctAnswers}/${response.data.totalQuestions} correct)`,
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
  
      if (error.response?.data?.message?.includes('already submitted')) {
        const newScores = {
          ...scores,
          [selectedTest._id]: {
            score: 0,
            timeSpent: 0,
            date: new Date().toISOString(),
            autoSubmitted: false
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
  }, [selectedTest, answers, startTime, scores, submitting, autoSubmitted]);

  useEffect(() => {
    let timerInterval;
    if (selectedTest && timeLeft !== null) {
      timerInterval = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 1) {
            clearInterval(timerInterval);
            setAutoSubmitted(true);
            handleSubmitTest();
            return 0;
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [selectedTest, handleSubmitTest, timeLeft]);

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">Weekly Test</h1>
        <p className="text-red-500 font-bold text-xl">THIS IS A TEST - PLEASE IGNORE IF YOU SEE THIS</p>
        <div className="text-center text-lg">Loading test...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">Weekly Test</h1>
        <p className="text-red-500 font-bold text-xl">THIS IS A TEST - PLEASE IGNORE IF YOU SEE THIS</p>
        <div className="text-center text-lg text-red-500">Error: {error}</div>
        <Button onClick={fetchTests} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (selectedTest) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="mb-6" key={selectedTest._id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{selectedTest.title}</h1>
                <p className="text-gray-600 mt-2">Week {selectedTest.weekNumber}</p>
              </div>
              <div className="flex items-center gap-4">
                {typeof timeLeft === 'number' && (
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
                <div className="space-y-3">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`q${qIndex}-o${oIndex}`}
                        name={`question-${qIndex}`}
                        value={oIndex.toString()}
                        checked={answers[qIndex]?.toString() === oIndex.toString()}
                        onChange={(e) => handleAnswerChange(qIndex, parseInt(e.target.value))}
                      />
                      <label htmlFor={`q${qIndex}-o${oIndex}`}>
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end space-x-4">
            <Button
              onClick={handleSubmitTest}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">Weekly Test</h1>
      <p className="text-red-500 font-bold text-xl">THIS IS A TEST - PLEASE IGNORE IF YOU SEE THIS</p>
      {loading && <div className="text-center text-lg">Loading test...</div>}
      {error && <div className="text-center text-lg text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Weekly Tests</h1>
            {Object.keys(scores).length > 0 && (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="font-semibold">Your Total Score:</span>
                  <span className="font-bold">{totalScoreData.averageScore}%</span>
                  {/* <span className="text-sm">
                    ({totalScoreData.totalCorrect}/{totalScoreData.totalQuestions} correct)
                  </span>
                  <span className="text-sm">Across {totalScoreData.totalTests} tests</span> */}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {tests.map(test => scores[test._id] && (
                    <div key={test._id} className="">
                      {/* <span>{test.title}</span> */}
                      {/* <span className="font-bold">{scores[test._id].score}%</span> */}
                      {/* <span className="text-sm">({formatTime(scores[test._id].timeSpent)})</span> */}
                      {/* {scores[test._id].autoSubmitted && ( */}
                        {/* <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Auto-submitted</span> */}
                      {/* )} */}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button 
              onClick={fetchTests}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Tests
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <Card key={test._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
                  <p className="text-gray-600 mb-4">Week {test.weekNumber}</p>
                  <p className="text-gray-600 mb-4">{test.questions.length} questions</p>
                  <p className="text-gray-600 mb-4">Time Limit: {test.timeLimit} minutes</p>
                  {scores[test._id] && (
                    <div className={`p-3 rounded-lg mb-4 ${scores[test._id].autoSubmitted ? 'bg-orange-50' : 'bg-green-50'}`}>
                      <p className={`font-semibold ${scores[test._id].autoSubmitted ? 'text-orange-700' : 'text-green-700'}`}>
                        Score: {scores[test._id].score}%
                        {scores[test._id].autoSubmitted && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Auto-submitted</span>
                        )}
                      </p>
                      <p className={`text-sm ${scores[test._id].autoSubmitted ? 'text-orange-600' : 'text-green-600'}`}>
                        Correct Answers: {scores[test._id].correctAnswers}/{scores[test._id].totalQuestions}
                      </p>
                      <p className={`text-sm ${scores[test._id].autoSubmitted ? 'text-orange-600' : 'text-green-600'}`}>
                        Time Taken: {formatTime(scores[test._id].timeSpent)}
                      </p>
                      <p className={`text-sm ${scores[test._id].autoSubmitted ? 'text-orange-600' : 'text-green-600'}`}>
                        Date: {new Date(scores[test._id].date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
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
      )}
    </div>
  );
};

export default WeeklyTest;