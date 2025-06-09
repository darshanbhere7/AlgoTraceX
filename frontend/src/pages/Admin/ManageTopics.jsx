import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ManageTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    difficulty: 'beginner'
  });
  const [error, setError] = useState(null);

    const fetchTopics = async () => {
      try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/admin/topics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
        setTopics(response.data);
      } catch (error) {
      console.error('Failed to fetch topics:', error);
      setError('Failed to load topics. Please try again.');
      toast.error('Failed to load topics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchTopics();
    // Set up polling for real-time updates
    const interval = setInterval(fetchTopics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/topics',
        newTopic,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setTopics([...topics, response.data]);
      setNewTopic({ title: '', description: '', difficulty: 'beginner' });
      toast.success('Topic added successfully!');
    } catch (error) {
      console.error('Failed to add topic:', error);
      toast.error('Failed to add topic. Please try again.');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/topics/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTopics(topics.filter(topic => topic._id !== topicId));
      toast.success('Topic deleted successfully!');
    } catch (error) {
      console.error('Failed to delete topic:', error);
      toast.error('Failed to delete topic. Please try again.');
    }
  };

  if (loading && topics.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading topics...</div>
      </div>
    );
  }

  if (error && topics.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Manage Topics</h1>
        <button 
          onClick={fetchTopics}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Topics
        </button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Topic</h2>
          <form onSubmit={handleAddTopic} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                type="text"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                placeholder="Enter topic title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                type="text"
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                placeholder="Enter topic description"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={newTopic.difficulty}
                onChange={(e) => setNewTopic({ ...newTopic, difficulty: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Button type="submit">Add Topic</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Topics</h2>
          <div className="space-y-4">
            {topics.map((topic) => (
              <div key={topic._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">{topic.title}</h3>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {topic.difficulty}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTopic(topic._id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageTopics;
