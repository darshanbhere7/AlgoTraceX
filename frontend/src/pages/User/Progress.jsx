import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Progress } from '@/components/ui'; // Assuming you have a Progress component
import { FaSync } from 'react-icons/fa';

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all practice questions
        const questionsResponse = await axios.get('http://localhost:5000/api/questions');
        setAllQuestions(questionsResponse.data);

        // Fetch user's completed questions
        const trackingResponse = await axios.get(
          'http://localhost:5000/api/practice-questions/tracking/questions',
          { headers }
        );
        setCompletedQuestions(new Set(trackingResponse.data.map(q => q.questionId)));

        // Fetch test results from localStorage
        const savedScores = localStorage.getItem('testScores');
        if (savedScores) {
          const parsedScores = JSON.parse(savedScores);
          // Convert the scores object into an array for easier mapping in JSX
          const formattedTestResults = Object.keys(parsedScores).map(testId => ({
            name: `Test ${testId.substring(0, 8)}...`, // You might want to get actual test names from a test API if available
            score: parsedScores[testId].score,
            date: new Date(parsedScores[testId].date).toLocaleDateString(),
          }));
          setTestResults(formattedTestResults);
        }

      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Overall Progress
  const totalQuestions = allQuestions.reduce((acc, topic) => acc + topic.questions.length, 0);
  const completedCount = completedQuestions.size;
  const overallProgress = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;

  // Calculate Topic-wise Progress
  const topicProgress = allQuestions.map(topic => {
    const totalTopicQuestions = topic.questions.length;
    const completedTopicQuestions = topic.questions.filter(q => completedQuestions.has(q.url)).length;
    const progress = totalTopicQuestions > 0 ? (completedTopicQuestions / totalTopicQuestions) * 100 : 0;
    return {
      topic: topic.topic,
      completed: completedTopicQuestions,
      total: totalTopicQuestions,
      progress: progress.toFixed(2),
    };
  }).filter(t => t.total > 0);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading Progress...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}><FaSync className="mr-2" /> Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Learning Progress</h1>

      {/* Overall Progress */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overall DSA Progress</h2>
        <div className="flex items-center space-x-4">
          <div className="text-5xl font-bold text-blue-600">{overallProgress.toFixed(1)}%</div>
          <div className="flex-1">
            <Progress value={overallProgress} className="h-4 bg-blue-200" />
            <p className="text-sm text-gray-600 mt-2">{completedCount} of {totalQuestions} questions completed</p>
          </div>
        </div>
      </Card>

      {/* Topic-wise Progress */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Topic-wise Progress</h2>
        <div className="space-y-4">
          {topicProgress.length > 0 ? ( topicProgress.map(topic => (
            <div key={topic.topic} className="flex items-center space-x-4">
              <div className="w-32 font-medium">{topic.topic}</div>
              <div className="flex-1">
                <Progress value={topic.progress} className="h-3 bg-green-200" />
                <p className="text-sm text-gray-600 mt-1">{topic.completed} / {topic.total} ({topic.progress}%)</p>
              </div>
            </div>
          )) ) : (
            <p className="text-gray-500">No topics with questions found.</p>
          )}
        </div>
      </Card>

      {/* Weekly Test Results */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Weekly Test Results</h2>
        {testResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((test, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No test results available yet.</p>
        )}
      </Card>
    </div>
  );
};

export default ProgressPage;