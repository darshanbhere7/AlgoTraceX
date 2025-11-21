import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
        axios.get('http://localhost:5000/api/tests', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/admin/topics', {
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
      const { data } = await axios.post('http://localhost:5000/api/tests', newTest, {
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
      await axios.delete(`http://localhost:5000/api/tests/${testId}`, {
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
    <div className="space-y-6 bg-slate-50 px-6 py-6 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
          <h1 className="text-2xl font-semibold text-slate-900">Manage Tests</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-200 text-slate-700"
          onClick={fetchData}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Create Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAddTest}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm text-slate-600">Test title</label>
                  <Input
                    value={newTest.title}
                    onChange={(event) =>
                      setNewTest((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Week 05 - Recursion"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-slate-600">Topic</label>
                  <Select
                    value={newTest.topic}
                    onValueChange={(value) => setNewTest((prev) => ({ ...prev, topic: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic._id} value={topic._id}>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm text-slate-600">Week number</label>
                  <Input
                    type="number"
                    min="1"
                    value={newTest.weekNumber}
                    onChange={(event) =>
                      setNewTest((prev) => ({ ...prev, weekNumber: event.target.value }))
                    }
                    placeholder="5"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-slate-600">Time limit (minutes)</label>
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
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Questions</p>
                {newTest.questions.map((question, qIndex) => (
                  <div key={`question-${qIndex}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        Question {qIndex + 1}
                      </p>
                      {newTest.questions.length > 1 && (
                        <button
                          type="button"
                          className="text-xs text-red-500 hover:underline"
                          onClick={() =>
                            setNewTest((prev) => ({
                              ...prev,
                              questions: prev.questions.filter((_, idx) => idx !== qIndex),
                            }))
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <Input
                      value={question.question}
                      onChange={(event) =>
                        handleQuestionChange(qIndex, 'question', event.target.value)
                      }
                      placeholder="Enter question prompt"
                      required
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
                        />
                      ))}
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <label className="text-sm text-slate-600">Correct answer</label>
                      <Select
                        value={question.correctAnswer.toString()}
                        onValueChange={(value) =>
                          handleQuestionChange(qIndex, 'correctAnswer', parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options.map((_, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              Option {index + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddQuestion}>
                  Add another question
                </Button>
              </div>

              <Button type="submit" className="w-full">
                Save Test
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title or topic"
                  className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                />
              </div>
              <p className="text-sm text-slate-500">
                Showing {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {loading && tests.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-md border border-dashed border-slate-200 bg-white">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No tests match your search.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTests.map((test) => {
                const isExpanded = expandedIds.has(test._id);
                const topicName =
                  topics.find((topic) => topic._id === test.topic)?.title || 'Unknown topic';
                return (
                  <Card key={test._id} className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {test.title}
                        </CardTitle>
                        <p className="text-xs text-slate-500">
                          Week {test.weekNumber} • {topicName} • {test.timeLimit} mins
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-600"
                          onClick={() => toggleExpand(test._id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteTest(test._id)}
                        >
                          ×
                        </Button>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="border-t border-slate-100 pt-3">
                        <div className="space-y-3">
                          {test.questions.map((question, index) => (
                            <div
                              key={`test-${test._id}-q-${index}`}
                              className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                            >
                              <p className="text-sm font-medium text-slate-800">
                                Q{index + 1}. {question.question}
                              </p>
                              <div className="mt-2 grid gap-2 md:grid-cols-2">
                                {question.options.map((option, optionIndex) => (
                                  <div
                                    key={`test-${test._id}-q-${index}-option-${optionIndex}`}
                                    className={`rounded-md px-3 py-2 text-sm ${
                                      optionIndex === question.correctAnswer
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-white text-slate-700'
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl border-slate-200">
          <DialogHeader>
            <DialogTitle>Test Preview</DialogTitle>
            <DialogDescription>Review the test before saving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="text-slate-500">Title:</span> {newTest.title || '—'}
            </p>
            <p>
              <span className="text-slate-500">Topic:</span>{' '}
              {topics.find((topic) => topic._id === newTest.topic)?.title || '—'}
            </p>
            <p>
              <span className="text-slate-500">Week:</span> {newTest.weekNumber || '—'}
            </p>
            <p>
              <span className="text-slate-500">Time limit:</span> {newTest.timeLimit} mins
            </p>
            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              {newTest.questions.map((question, index) => (
                <div key={`preview-${index}`} className="space-y-2">
                  <p className="font-medium text-slate-800">
                    Q{index + 1}. {question.question || '—'}
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={`preview-${index}-option-${optionIndex}`}
                        className={`rounded-md px-3 py-2 text-sm ${
                          optionIndex === question.correctAnswer
                            ? 'bg-green-50 text-green-700'
                            : 'bg-white text-slate-700'
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
  );
};

export default ManageTests;
