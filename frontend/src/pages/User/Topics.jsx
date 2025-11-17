import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-lg">Loading topics...</p>
        </motion.div>
      </div>
    );
  }

  if (error && topics.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      </div>
    );
  }

  const filteredTopics = (difficulty) => {
    return topics.filter(topic => topic.difficulty === difficulty);
  };

  const renderTopics = (difficulty, colorClasses) => {
    return filteredTopics(difficulty).map((topic, index) => (
      <motion.div
        key={topic._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ y: -4 }}
      >
        <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{topic.title}</h3>
              <span className={`inline-block px-3 py-1 ${colorClasses.bg} ${colorClasses.text} rounded-full text-sm border ${colorClasses.border}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-neutral-800 p-4 rounded-lg text-gray-900 dark:text-gray-100">
              {topic.description}
            </pre>
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="p-6 pt-24 pb-12 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Learning Topics</h1>
          <p className="text-gray-600 dark:text-gray-400">Explore topics by difficulty level</p>
        </motion.div>
        
        <Tabs defaultValue="beginner" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
            <TabsTrigger value="beginner" className="text-gray-900 dark:text-white data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-neutral-800">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate" className="text-gray-900 dark:text-white data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-neutral-800">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced" className="text-gray-900 dark:text-white data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-neutral-800">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="beginner" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {renderTopics('beginner', {
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-800 dark:text-green-300',
                border: 'border-green-200 dark:border-green-800'
              })}
            </div>
          </TabsContent>

          <TabsContent value="intermediate" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {renderTopics('intermediate', {
                bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                text: 'text-yellow-800 dark:text-yellow-300',
                border: 'border-yellow-200 dark:border-yellow-800'
              })}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {renderTopics('advanced', {
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-800 dark:text-red-300',
                border: 'border-red-200 dark:border-red-800'
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Topics;
