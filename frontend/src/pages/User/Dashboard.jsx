import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!userData) {
    return <div className="p-6">Please login to view this page.</div>;
  }

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6">Your Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-medium mb-4">Welcome, {userData.name}</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {userData.email}</p>
            <p><span className="font-medium">Role:</span> {userData.role}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-medium mb-4">Overall Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Overall Completion</span>
                <span>{userData.progress?.overallProgress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(userData.progress?.overallProgress || 0)}`}
                  style={{ width: `${userData.progress?.overallProgress || 0}%` }}
                ></div>
              </div>
            </div>
            <Link 
              to="/user/progress" 
              className="inline-block mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              View Detailed Progress
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-medium mb-4">Topic Progress</h3>
          <div className="space-y-3">
            {userData.progress?.topics && Object.entries(userData.progress.topics).map(([topic, progress]) => (
              <div key={topic}>
                <div className="flex justify-between mb-1">
                  <span className="capitalize">{topic.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(progress)}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-medium mb-4">Recent Test Scores</h3>
          <div className="space-y-2">
            {userData.progress?.testScores?.length > 0 ? (
              userData.progress.testScores.slice(-3).map((test, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>Test {index + 1}</span>
                  <span className={`font-medium ${test.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                    {test.score}%
                  </span>
                </div>
              ))
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
        </div>

        <div className="bg-white p-6 rounded shadow-md">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;