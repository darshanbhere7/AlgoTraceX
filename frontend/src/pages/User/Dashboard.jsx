import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Progress } from '@/components/ui';
import { FaSync } from 'react-icons/fa';

const Dashboard = () => {
  const { user, loading: userLoading } = useAuth();
  const [overallLoading, setOverallLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setOverallLoading(false);
        return;
      }

      setOverallLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const questionsResponse = await axios.get('http://localhost:5000/api/questions');
        setAllQuestions(questionsResponse.data);

        const trackingResponse = await axios.get(
          'http://localhost:5000/api/practice-questions/tracking/questions',
          { headers }
        );
        setCompletedQuestions(new Set(trackingResponse.data.map(q => q.questionId)));

        const savedScores = localStorage.getItem('testScores');
        if (savedScores) {
          const parsedScores = JSON.parse(savedScores);
          const formattedTestResults = Object.keys(parsedScores).map(testId => ({
            name: `Test ${testId.substring(0, 8)}...`,
            score: parsedScores[testId].score,
            date: new Date(parsedScores[testId].date).toLocaleDateString(),
          }));
          setTestResults(formattedTestResults);
        }

      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setOverallLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalQuestions = allQuestions.reduce((acc, topic) => acc + topic.questions.length, 0);
  const completedCount = completedQuestions.size;
  const overallProgress = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;

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

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (userLoading || overallLoading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}><FaSync className="mr-2" /> Retry</Button>
      </div>
    );
  }

  if (!user) {
    return <div className="p-6">Please login to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Your Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Welcome, {user.name}</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Overall Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Overall Completion</span>
                <span>{overallProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>
            <Link 
              to="/user/progress" 
              className="inline-block mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              View Detailed Progress
            </Link>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Topic Progress</h3>
          <div className="space-y-3">
            {topicProgress.length > 0 ? ( topicProgress.map((topic, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="capitalize">{topic.topic}</span>
                  <span>{topic.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <Progress value={parseFloat(topic.progress)} className="h-2" />
                </div>
              </div>
            )) ) : (
              <p className="text-gray-500">No topics with questions found.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Recent Test Scores</h3>
          <div className="space-y-2">
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
                    {testResults.slice(-3).map((test, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.score}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No test scores yet</p>
            )}
            <Link 
              to="/user/weekly-test" 
              className="inline-block mt-4 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
            >
              Take Weekly Test
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Quick Actions</h3>
          <div className="flex flex-col space-y-2">
            <Link 
              to="/user/visualizer" 
              className="bg-green-500 text-white py-2 px-4 rounded text-center hover:bg-green-600"
            >
              Algorithm Visualizer
            </Link>
            <Link 
              to="/user/ai-recommendations" 
              className="bg-yellow-500 text-white py-2 px-4 rounded text-center hover:bg-yellow-600"
            >
              AI Recommendations
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;