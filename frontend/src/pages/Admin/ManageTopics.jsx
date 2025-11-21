import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    <div className="space-y-6 bg-slate-50 px-6 py-6 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
          <h1 className="text-2xl font-semibold text-slate-900">Manage Topics</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-200 text-slate-700"
          onClick={fetchTopics}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Add Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAddTopic}>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-600">Title</label>
                <Input
                  value={newTopic.title}
                  onChange={(event) =>
                    setNewTopic((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Binary Search fundamentals"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-slate-600">Description</label>
                <Textarea
                  value={newTopic.description}
                  onChange={(event) =>
                    setNewTopic((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="min-h-[160px] font-mono text-sm"
                  placeholder={`Input: Sorted array nums, target value x\nOutput: Index if found else -1\nAlgorithm:\n1. l = 0, r = n - 1\n...`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-slate-600">Difficulty</label>
                <select
                  value={newTopic.difficulty}
                  onChange={(event) =>
                    setNewTopic((prev) => ({ ...prev, difficulty: event.target.value }))
                  }
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-slate-200 text-slate-700"
                  onClick={() => setPreviewOpen(true)}
                >
                  Preview
                </Button>
                <Button type="submit" className="flex-1">
                  Save
                </Button>
              </div>
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
                  placeholder="Search topics"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {difficultyFilters.map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setFilter(chip.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      filter === chip.value
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading && topics.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-md border border-dashed border-slate-200 bg-white">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No topics match your filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTopics.map((topic) => {
                const isExpanded = expandedIds.has(topic._id);
                return (
                  <Card key={topic._id} className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {topic.title}
                        </CardTitle>
                        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium lowercase text-slate-600">
                          {topic.difficulty}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-600"
                          onClick={() => toggleExpand(topic._id)}
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
                          onClick={() => handleDelete(topic._id)}
                        >
                          ×
                        </Button>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="border-t border-slate-100 pt-3">
                        <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                          {topic.description}
                        </pre>
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
        <DialogContent className="max-w-2xl border-slate-200">
          <DialogHeader>
            <DialogTitle>Topic Preview</DialogTitle>
            <DialogDescription>Verify the content before saving.</DialogDescription>
          </DialogHeader>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {newTopic.title || 'Untitled Topic'}
              </CardTitle>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {newTopic.difficulty}
              </span>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                {newTopic.description || 'Description will appear here.'}
              </pre>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTopics;

