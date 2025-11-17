import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Timer } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-lg">Loading test...</p>
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
          <p className="text-xl text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={fetchTests} variant="outline" className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700">
              Try Again
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (selectedTest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="p-6 pt-24 pb-12 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm" key={selectedTest._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedTest.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Week {selectedTest.weekNumber}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {typeof timeLeft === 'number' && (
                      <motion.div
                        animate={{ scale: timeLeft <= 10 ? [1, 1.05, 1] : 1 }}
                        transition={{ repeat: timeLeft <= 10 ? Infinity : 0, duration: 0.5 }}
                        className={`flex items-center gap-2 text-lg font-semibold px-4 py-2 rounded-lg ${timeLeft <= 10 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white'}`}
                      >
                        <Timer className="h-5 w-5" />
                        <span className={timeLeft <= 10 ? 'font-bold' : ''}>
                          {formatTime(timeLeft)}
                        </span>
                      </motion.div>
                    )}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button onClick={() => setSelectedTest(null)} variant="outline" className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700">
                        Back to Tests
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6">
            {selectedTest.questions.map((question, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: qIndex * 0.1 }}
              >
                <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Question {qIndex + 1}: {question.question}
                    </h3>
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => (
                        <motion.div
                          key={oIndex}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800"
                        >
                          <input
                            type="radio"
                            id={`q${qIndex}-o${oIndex}`}
                            name={`question-${qIndex}`}
                            value={oIndex.toString()}
                            checked={answers[qIndex]?.toString() === oIndex.toString()}
                            onChange={(e) => handleAnswerChange(qIndex, parseInt(e.target.value))}
                            className="text-gray-900 dark:text-white"
                          />
                          <label htmlFor={`q${qIndex}-o${oIndex}`} className="text-gray-900 dark:text-white cursor-pointer">
                            {option}
                          </label>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-end space-x-4"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Test'}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Weekly Tests</h1>
          <p className="text-gray-600 dark:text-gray-400">Test your knowledge with weekly assessments</p>
        </motion.div>

        {!loading && !error && (
          <div>
            <div className="flex justify-between items-center mb-6">
              {Object.keys(scores).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4 flex-wrap"
                >
                  <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-4 py-2 rounded-full flex items-center gap-2 border border-purple-200 dark:border-purple-800">
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
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={fetchTests}
                  className="px-4 py-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 rounded-lg transition-colors shadow-sm"
                >
                  Refresh Tests
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test, index) => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{test.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Week {test.weekNumber}</p>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{test.questions.length} questions</p>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Time Limit: {test.timeLimit} minutes</p>
                      {scores[test._id] && (
                        <div className={`p-3 rounded-lg mb-4 ${scores[test._id].autoSubmitted ? 'bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'}`}>
                          <p className={`font-semibold ${scores[test._id].autoSubmitted ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300'}`}>
                            Score: {scores[test._id].score}%
                            {scores[test._id].autoSubmitted && (
                              <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full">Auto-submitted</span>
                            )}
                          </p>
                          <p className={`text-sm ${scores[test._id].autoSubmitted ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                            Correct Answers: {scores[test._id].correctAnswers}/{scores[test._id].totalQuestions}
                          </p>
                          <p className={`text-sm ${scores[test._id].autoSubmitted ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                            Time Taken: {formatTime(scores[test._id].timeSpent)}
                          </p>
                          <p className={`text-sm ${scores[test._id].autoSubmitted ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                            Date: {new Date(scores[test._id].date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => handleStartTest(test)}
                          className="w-full bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700"
                          disabled={scores[test._id] !== undefined}
                        >
                          {scores[test._id] ? 'Test Completed' : 'Start Test'}
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyTest;