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

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-medium mb-4">Welcome, {userData.name}</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {userData.email}</p>
            <p><span className="font-medium">Role:</span> {userData.role}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-medium mb-4">Progress Overview</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Current Progress:</span>{' '}
              {typeof userData.progress === 'object' && userData.progress?.value 
                ? `${userData.progress.value}%` 
                : 'No progress data yet'}
            </p>
            <Link 
              to="/user/progress" 
              className="inline-block mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              View Details
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
              to="/user/weekly-test" 
              className="bg-purple-500 text-white py-2 px-4 rounded text-center hover:bg-purple-600"
            >
              Take Weekly Test
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