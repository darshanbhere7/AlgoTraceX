import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Progress = () => {
  const { user, updateProgress } = useAuth();
  const [progressValue, setProgressValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    if (user && user.progress) {
      // If progress is a number (old format), use it directly
      if (typeof user.progress === 'number') {
        setProgressValue(user.progress);
      } 
      // If progress is stored as an object with a value property (new format)
      else if (typeof user.progress === 'object' && user.progress.value) {
        setProgressValue(user.progress.value);
      }
      // Otherwise default to 0
      else {
        setProgressValue(0);
      }
    }
  }, [user]);

  const handleUpdateProgress = async () => {
    setIsLoading(true);
    setUpdateMessage('');
    
    // Calculate new progress value
    const newValue = Math.min(progressValue + 10, 100);
    
    // Update progress in the backend
    const success = await updateProgress({
      value: newValue,
      lastUpdated: new Date().toISOString()
    });
    
    if (success) {
      setProgressValue(newValue);
      setUpdateMessage('Progress updated successfully!');
    } else {
      setUpdateMessage('Failed to update progress. Please try again.');
    }
    
    setIsLoading(false);
  };

  if (!user) {
    return <div>Please login to view this page.</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6">Your Progress</h2>
      
      <div className="bg-white p-6 rounded shadow-md">
        <h3 className="text-xl mb-4">Course Completion: {progressValue}%</h3>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
          <div 
            className="bg-blue-500 h-4 rounded-full" 
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
        
        {updateMessage && (
          <div className={`mb-4 ${updateMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {updateMessage}
          </div>
        )}
        
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={handleUpdateProgress}
          disabled={isLoading || progressValue >= 100}
        >
          {isLoading ? 'Updating...' : 'Complete Next Lesson'}
        </button>
        
        {progressValue >= 100 && (
          <p className="mt-4 text-green-600 font-medium">
            Congratulations! You've completed all lessons.
          </p>
        )}
      </div>
      
      <div className="mt-6 bg-white p-6 rounded shadow-md">
        <h3 className="text-xl mb-4">Topic Breakdown</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span>Arrays</span>
              <span>80%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Linked Lists</span>
              <span>65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Trees</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Graphs</span>
              <span>20%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;