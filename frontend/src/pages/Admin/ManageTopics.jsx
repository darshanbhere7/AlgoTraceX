import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ManageTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get('/api/admin/topics');
        setTopics(response.data);
      } catch (error) {
        console.error('Failed to fetch topics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleAddTopic = async () => {
    if (!newTopic) {
      setMessage('Please enter a topic name');
      return;
    }

    try {
      const response = await axios.post('/api/admin/topics', { name: newTopic });
      setTopics([...topics, response.data]);
      setNewTopic('');
      setMessage('Topic added successfully!');
    } catch (error) {
      console.error('Failed to add topic', error);
      setMessage('Error adding topic');
    }
  };

  if (loading) {
    return <p>Loading topics...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Manage Topics</h1>

      {message && <p className="text-red-500">{message}</p>}

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Available Topics</h2>
          <ul className="list-disc ml-6">
            {topics.map((topic) => (
              <li key={topic._id} className="mb-2">
                {topic.name}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6 flex space-x-4">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
          placeholder="New topic"
        />
        <Button onClick={handleAddTopic}>Add Topic</Button>
      </div>
    </div>
  );
};

export default ManageTopics;
