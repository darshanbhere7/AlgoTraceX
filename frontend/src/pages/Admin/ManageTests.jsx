import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Loader2, RefreshCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildApiUrl } from '@/config/api';

const initialQuestion = {
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
};

const initialTest = {
  title: '',
  topic: '',
  weekNumber: '',
  timeLimit: 10,
  questions: [initialQuestion],
};

const ManageTests = () => {
  const [tests, setTests] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newTest, setNewTest] = useState(initialTest);

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [testsResponse, topicsResponse] = await Promise.all([
        axios.get(buildApiUrl('/tests'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(buildApiUrl('/admin/topics'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTests(testsResponse.data);
      setTopics(topicsResponse.data);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to load data. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTests = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return tests.filter((test) => {
      const topicTitle = topics.find((topic) => topic._id === test.topic)?.title || '';
      return (
        test.title.toLowerCase().includes(query) || topicTitle.toLowerCase().includes(query)
      );
    });
  }, [tests, topics, searchTerm]);

  const handleAddQuestion = () => {
    setNewTest((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...initialQuestion }],
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setNewTest((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) =>
        i === index ? { ...question, [field]: value } : question
      ),
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setNewTest((prev) => ({
      ...prev,
      questions: prev.questions.map((question, qIndex) =>
        qIndex === questionIndex
          ? {
              ...question,
              options: question.options.map((opt, idx) => (idx === optionIndex ? value : opt)),
            }
          : question
      ),
    }));
  };

  const handleAddTest = async (event) => {
    event.preventDefault();
    if (newTest.timeLimit < 1) {
      toast.error('Time limit must be at least 1 minute');
      return;
    }
    try {
      const { data } = await axios.post(buildApiUrl('/tests'), newTest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests((prev) => [...prev, data]);
      setNewTest(initialTest);
      toast.success('Test added successfully');
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to add test. Please try again.';
      toast.error(message);
    }
  };

  const handleDeleteTest = async (testId) => {
    try {
      await axios.delete(buildApiUrl(`/tests/${testId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests((prev) => prev.filter((test) => test._id !== testId));
      toast.success('Test deleted successfully');
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete test. Please try again.';
      toast.error(message);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Tests</h1>
          </div>
          <motion.button 
            onClick={fetchData}
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
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Create Test</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleAddTest}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Test title</label>
                      <Input
                        value={newTest.title}
                        onChange={(event) =>
                          setNewTest((prev) => ({ ...prev, title: event.target.value }))
                        }
                        placeholder="Week 05 - Recursion"
                        required
                        className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
                      <Select
                        value={newTest.topic}
                        onValueChange={(value) => setNewTest((prev) => ({ ...prev, topic: value }))}
                      >
                        <SelectTrigger className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
                          {topics.map((topic) => (
                            <SelectItem key={topic._id} value={topic._id} className="text-gray-900 dark:text-white">
                              {topic.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Week number</label>
                      <Input
                        type="number"
                        min="1"
                        value={newTest.weekNumber}
                        onChange={(event) =>
                          setNewTest((prev) => ({ ...prev, weekNumber: event.target.value }))
                        }
                        placeholder="5"
                        required
                        className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time limit (minutes)</label>
                      <Input
                        type="number"
                        min="1"
                        value={newTest.timeLimit}
                        onChange={(event) =>
                          setNewTest((prev) => ({
                            ...prev,
                            timeLimit: parseInt(event.target.value) || 10,
                          }))
                        }
                        placeholder="10"
                        required
                        className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions</p>
                    {newTest.questions.map((question, qIndex) => (
                      <div key={`question-${qIndex}`} className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Question {qIndex + 1}
                          </p>
                          {newTest.questions.length > 1 && (
                            <motion.button
                              type="button"
                              onClick={() =>
                                setNewTest((prev) => ({
                                  ...prev,
                                  questions: prev.questions.filter((_, idx) => idx !== qIndex),
                                }))
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-xs text-red-600 dark:text-red-400 hover:underline"
                            >
                              Remove
                            </motion.button>
                          )}
                        </div>
                        <Input
                          value={question.question}
                          onChange={(event) =>
                            handleQuestionChange(qIndex, 'question', event.target.value)
                          }
                          placeholder="Enter question prompt"
                          required
                          className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white"
                        />
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {question.options.map((option, optionIndex) => (
                            <Input
                              key={`question-${qIndex}-option-${optionIndex}`}
                              value={option}
                              onChange={(event) =>
                                handleOptionChange(qIndex, optionIndex, event.target.value)
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              required
                              className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white"
                            />
                          ))}
                        </div>
                        <div className="mt-3 space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correct answer</label>
                          <Select
                            value={question.correctAnswer.toString()}
                            onValueChange={(value) =>
                              handleQuestionChange(qIndex, 'correctAnswer', parseInt(value))
                            }
                          >
                            <SelectTrigger className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
                              {question.options.map((_, index) => (
                                <SelectItem key={index} value={index.toString()} className="text-gray-900 dark:text-white">
                                  Option {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                    <motion.button
                      type="button"
                      onClick={handleAddQuestion}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm"
                    >
                      Add another question
                    </motion.button>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm font-medium"
                  >
                    Save Test
                  </motion.button>
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
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by title or topic"
                    className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            {loading && tests.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                No tests match your search.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTests.map((test, index) => {
                  const isExpanded = expandedIds.has(test._id);
                  const topicName =
                    topics.find((topic) => topic._id === test.topic)?.title || 'Unknown topic';
                  return (
                    <motion.div
                      key={test._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                              {test.title}
                            </CardTitle>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Week {test.weekNumber} • {topicName} • {test.timeLimit} mins
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <motion.button
                              onClick={() => toggleExpand(test._id)}
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
                              onClick={() => handleDeleteTest(test._id)}
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
                            <div className="space-y-3">
                              {test.questions.map((question, qIndex) => (
                                <div
                                  key={`test-${test._id}-q-${qIndex}`}
                                  className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 p-3"
                                >
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    Q{qIndex + 1}. {question.question}
                                  </p>
                                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                                    {question.options.map((option, optionIndex) => (
                                      <div
                                        key={`test-${test._id}-q-${qIndex}-option-${optionIndex}`}
                                        className={`rounded-md px-3 py-2 text-sm ${
                                          optionIndex === question.correctAnswer
                                            ? 'bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white font-medium'
                                            : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300'
                                        }`}
                                      >
                                        {option}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
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
          <DialogContent className="max-w-3xl bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Test Preview</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">Review the test before saving.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="text-gray-500 dark:text-gray-400">Title:</span> {newTest.title || '—'}
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">Topic:</span>{' '}
                {topics.find((topic) => topic._id === newTest.topic)?.title || '—'}
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">Week:</span> {newTest.weekNumber || '—'}
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">Time limit:</span> {newTest.timeLimit} mins
              </p>
              <div className="space-y-3 rounded-md border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 p-4">
                {newTest.questions.map((question, index) => (
                  <div key={`preview-${index}`} className="space-y-2">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      Q{index + 1}. {question.question || '—'}
                    </p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={`preview-${index}-option-${optionIndex}`}
                          className={`rounded-md px-3 py-2 text-sm ${
                            optionIndex === question.correctAnswer
                              ? 'bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white font-medium'
                              : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {option || '—'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageTests;
