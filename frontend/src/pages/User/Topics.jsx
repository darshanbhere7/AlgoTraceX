import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/topics');
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
  }, []);

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

  const filteredTopics = (difficulty) => {
    return topics.filter(topic => topic.difficulty === difficulty);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Learning Topics</h1>
      
      <Tabs defaultValue="beginner" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="beginner">
          <div className="grid grid-cols-1 gap-4">
            {filteredTopics('beginner').map((topic) => (
              <Card key={topic._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{topic.title}</h3>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Beginner
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded-lg">
                    {topic.description}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="intermediate">
          <div className="grid grid-cols-1 gap-4">
            {filteredTopics('intermediate').map((topic) => (
              <Card key={topic._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{topic.title}</h3>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Intermediate
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded-lg">
                    {topic.description}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="grid grid-cols-1 gap-4">
            {filteredTopics('advanced').map((topic) => (
              <Card key={topic._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{topic.title}</h3>
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      Advanced
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded-lg">
                    {topic.description}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Topics;
