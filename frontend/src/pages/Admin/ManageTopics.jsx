import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Loader2, RefreshCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const difficultyFilters = [
  { value: 'all', label: 'All' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const ManageTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
  });

  const token = localStorage.getItem('token');

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/admin/topics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopics(data);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to load topics. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const filteredTopics = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return topics.filter((topic) => {
      const matchesSearch =
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query);
      const matchesFilter = filter === 'all' || topic.difficulty === filter;
      return matchesSearch && matchesFilter;
    });
  }, [topics, searchTerm, filter]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddTopic = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/admin/topics',
        newTopic,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopics((prev) => [...prev, data]);
      setNewTopic({ title: '', description: '', difficulty: 'beginner' });
      setPreviewOpen(false);
      toast.success('Topic added successfully');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to add topic. Please try again.';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopics((prev) => prev.filter((topic) => topic._id !== id));
      toast.success('Topic deleted successfully');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to delete topic. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="p-6 pt-24 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-1">Admin</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Topics</h1>
          </div>
          <motion.button 
            onClick={fetchTopics}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-[360px,1fr]"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Add Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleAddTopic}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <Input
                      value={newTopic.title}
                      onChange={(event) =>
                        setNewTopic((prev) => ({ ...prev, title: event.target.value }))
                      }
                      placeholder="Binary Search fundamentals"
                      required
                      className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <Textarea
                      value={newTopic.description}
                      onChange={(event) =>
                        setNewTopic((prev) => ({ ...prev, description: event.target.value }))
                      }
                      className="min-h-[160px] font-mono text-sm bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white"
                      placeholder={`Input: Sorted array nums, target value x\nOutput: Index if found else -1\nAlgorithm:\n1. l = 0, r = n - 1\n...`}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
                    <select
                      value={newTopic.difficulty}
                      onChange={(event) =>
                        setNewTopic((prev) => ({ ...prev, difficulty: event.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-neutral-700"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm"
                    >
                      Preview
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm font-medium"
                    >
                      Save
                    </motion.button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
              <CardContent className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2 rounded-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2">
                  <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search topics"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {difficultyFilters.map((chip) => (
                    <motion.button
                      key={chip.value}
                      onClick={() => setFilter(chip.value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        filter === chip.value
                          ? 'bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {chip.label}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {loading && topics.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                No topics match your filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTopics.map((topic, index) => {
                  const isExpanded = expandedIds.has(topic._id);
                  return (
                    <motion.div
                      key={topic._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                              {topic.title}
                            </CardTitle>
                            <span className="inline-flex rounded-full bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium lowercase text-gray-700 dark:text-gray-300">
                              {topic.difficulty}
                            </span>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <motion.button
                              onClick={() => toggleExpand(topic._id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(topic._id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              ×
                            </motion.button>
                          </div>
                        </CardHeader>
                        {isExpanded && (
                          <CardContent className="border-t border-gray-200 dark:border-neutral-800 pt-3">
                            <pre className="whitespace-pre-wrap rounded-md bg-gray-50 dark:bg-neutral-800 p-3 text-sm text-gray-700 dark:text-gray-300">
                              {topic.description}
                            </pre>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Topic Preview</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">Verify the content before saving.</DialogDescription>
            </DialogHeader>
            <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {newTopic.title || 'Untitled Topic'}
                </CardTitle>
                <span className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                  {newTopic.difficulty}
                </span>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap rounded-md bg-gray-50 dark:bg-neutral-800 p-3 text-sm text-gray-700 dark:text-gray-300">
                  {newTopic.description || 'Description will appear here.'}
                </pre>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageTopics;

