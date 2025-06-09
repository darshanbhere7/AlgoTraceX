import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Progress = () => {
  const { user, updateProgress } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');
  const [localProgress, setLocalProgress] = useState(null);

  // Initialize local progress when user data is available
  useEffect(() => {
    const initializeProgress = async () => {
      try {
        if (user?.progress) {
          setLocalProgress(user.progress);
        } else {
          // If no progress exists, initialize with default values
          const defaultProgress = {
            overallProgress: 0,
            topics: {
              arrays: 0,
              linkedLists: 0,
              trees: 0,
              graphs: 0
            },
            completedLessons: [],
            testScores: [],
            lastUpdated: new Date().toISOString()
          };
          setLocalProgress(defaultProgress);
          
          // Update the backend with default progress
          await updateProgress(defaultProgress);
        }
      } catch (error) {
        console.error('Error initializing progress:', error);
        setUpdateMessage('Error loading progress data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      initializeProgress();
    }
  }, [user, updateProgress]);

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleUpdateProgress = async (topic, increment) => {
    if (!localProgress) return;
    
    setIsLoading(true);
    setUpdateMessage('');
    
    try {
      // Get current progress for all topics
      const currentTopics = localProgress.topics || {};
      
      // Calculate new progress for the specific topic
      const currentTopicProgress = currentTopics[topic] || 0;
      const newTopicProgress = Math.min(currentTopicProgress + increment, 100);
      
      // Create new topics object with all existing topics and the updated one
      const updatedTopics = {
        ...currentTopics,
        [topic]: newTopicProgress
      };
      
      // Calculate new overall progress
      const totalTopics = Object.keys(updatedTopics).length;
      const newTotal = Object.values(updatedTopics).reduce((sum, val) => sum + val, 0);
      const newOverallProgress = Math.round(newTotal / totalTopics);

      // Update local state immediately for better UX
      const updatedProgress = {
        ...localProgress,
        overallProgress: newOverallProgress,
        topics: updatedTopics,
        lastUpdated: new Date().toISOString()
      };
      
      setLocalProgress(updatedProgress);

      // Update progress in the backend
      const success = await updateProgress(updatedProgress);
      
      if (success) {
        setUpdateMessage('Progress updated successfully!');
      } else {
        // Revert local state if update failed
        setLocalProgress(user.progress);
        setUpdateMessage('Failed to update progress. Please try again.');
      }
    } catch (error) {
      // Revert local state if update failed
      setLocalProgress(user.progress);
      setUpdateMessage('An error occurred while updating progress.');
      console.error('Update progress error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Please login to view this page.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading progress data...</div>
      </div>
    );
  }

  // Use localProgress as the source of truth
  const progress = localProgress || {
    overallProgress: 0,
    topics: {
      arrays: 0,
      linkedLists: 0,
      trees: 0,
      graphs: 0
    }
  };

  const topics = progress.topics || {};
  const overallProgress = progress.overallProgress || 0;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6">Your Learning Progress</h2>
      
      <div className="bg-white p-6 rounded shadow-md mb-6">
        <h3 className="text-xl mb-4">Overall Progress: {overallProgress}%</h3>
        
        {/* Overall Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
          <div 
            className={`h-4 rounded-full ${getProgressColor(overallProgress)}`}
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        
        {updateMessage && (
          <div className={`mb-4 ${updateMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {updateMessage}
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded shadow-md">
        <h3 className="text-xl mb-4">Topic-wise Progress</h3>
        
        <div className="space-y-6">
          {Object.entries(topics).map(([topic, progress]) => (
            <div key={topic} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium capitalize">
                  {topic.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-lg">{progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getProgressColor(progress)}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleUpdateProgress(topic, 10)}
                  disabled={isLoading || progress >= 100}
                  className="bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isLoading ? 'Updating...' : '+10%'}
                </button>
                <button
                  onClick={() => handleUpdateProgress(topic, 25)}
                  disabled={isLoading || progress >= 100}
                  className="bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
                >
                  {isLoading ? 'Updating...' : '+25%'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {progress.completedLessons?.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded shadow-md">
          <h3 className="text-xl mb-4">Completed Lessons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.completedLessons.map((lesson, index) => (
              <div key={index} className="bg-green-50 p-3 rounded border border-green-200">
                <span className="text-green-700">{lesson}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress.testScores?.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded shadow-md">
          <h3 className="text-xl mb-4">Test History</h3>
          <div className="space-y-3">
            {progress.testScores.map((test, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">Test {index + 1}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {new Date(test.date).toLocaleDateString()}
                  </span>
                </div>
                <span className={`font-medium ${test.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                  {test.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;