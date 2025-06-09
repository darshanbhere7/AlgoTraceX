import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const WeeklyTest = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/tests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setTests(response.data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      setError('Failed to load tests. Please try again.');
      toast.error('Failed to load tests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleStartTest = (test) => {
    setSelectedTest(test);
    setAnswers({});
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmitTest = async () => {
    try {
      setSubmitting(true);
      
      // Calculate score
      let correctAnswers = 0;
      selectedTest.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / selectedTest.questions.length) * 100);

      // Submit test results
      await axios.post(
        'http://localhost:5000/api/tests/submit',
        {
          testId: selectedTest._id,
          answers,
          score
        },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success(`Test completed! Your score: ${score}%`);
      setSelectedTest(null);
      setAnswers({});
      navigate('/user/progress');
    } catch (error) {
      console.error('Failed to submit test:', error);
      toast.error('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (selectedTest) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{selectedTest.title}</h1>
          <Button
            variant="outline"
            onClick={() => setSelectedTest(null)}
          >
            Back to Tests
          </Button>
        </div>

        <div className="space-y-6">
          {selectedTest.questions.map((question, qIndex) => (
            <Card key={qIndex}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Question {qIndex + 1}: {question.question}
                </h3>
                <RadioGroup
                  value={answers[qIndex]?.toString()}
                  onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
                  className="space-y-3"
                >
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={oIndex.toString()}
                        id={`q${qIndex}-o${oIndex}`}
                      />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`}>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Weekly Tests</h1>
        <button 
          onClick={fetchTests}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Tests
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <Card key={test._id}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
              <p className="text-gray-600 mb-4">Week {test.weekNumber}</p>
              <p className="text-gray-600 mb-4">{test.questions.length} questions</p>
              <Button
                onClick={() => handleStartTest(test)}
                className="w-full"
              >
                Start Test
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeeklyTest;
