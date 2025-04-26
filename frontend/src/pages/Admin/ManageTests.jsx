import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const ManageTests = () => {
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState({ name: '', topic: '', duration: '' });
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get('/api/admin/tests');
        setTests(response.data);
      } catch (error) {
        console.error('Failed to fetch tests', error);
      }
    };

    const fetchTopics = async () => {
      try {
        const response = await axios.get('/api/admin/topics');
        setTopics(response.data);
      } catch (error) {
        console.error('Failed to fetch topics', error);
      }
    };

    fetchTests();
    fetchTopics();
  }, []);

  const handleAddTest = async () => {
    if (!newTest.name || !newTest.topic || !newTest.duration) return;

    try {
      const response = await axios.post('/api/admin/tests', newTest);
      setTests((prevTests) => [...prevTests, response.data]);
      setNewTest({ name: '', topic: '', duration: '' });
    } catch (error) {
      console.error('Failed to add test', error);
    }
  };

  const handleDeleteTest = async (id) => {
    try {
      await axios.delete(`/api/admin/tests/${id}`);
      setTests((prevTests) => prevTests.filter((test) => test._id !== id));
    } catch (error) {
      console.error('Failed to delete test', error);
    }
  };

  const handleSelectTopic = (value) => {
    setNewTest({ ...newTest, topic: value });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Manage Tests</h1>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Add New Test</h2>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter test name"
              value={newTest.name}
              onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
            />
            
            <Select value={newTest.topic} onValueChange={handleSelectTopic}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic._id} value={topic._id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              placeholder="Enter test duration (in minutes)"
              value={newTest.duration}
              onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
            />
            <Button onClick={handleAddTest}>Add Test</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Tests</h2>
        {tests.length === 0 ? (
          <p>No tests available.</p>
        ) : (
          <ul>
            {tests.map((test) => (
              <li key={test._id} className="flex justify-between items-center mb-2 p-3 border rounded-md">
                <span>{test.name}</span>
                <Button onClick={() => handleDeleteTest(test._id)} variant="destructive">
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageTests;