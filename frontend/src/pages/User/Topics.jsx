import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import TopicCard from '@/components/topics/TopicCard';
import { BookOpen, RefreshCw, Sparkles } from 'lucide-react';

// Sortable Item Wrapper
const SortableTopicItem = ({ topic, index, onBookmark, onPin, onQuiz, onProblems, isBookmarked, isPinned }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="cursor-grab active:cursor-grabbing"
      >
        <TopicCard
          topic={topic}
          onBookmark={onBookmark}
          onPin={onPin}
          onQuiz={onQuiz}
          onProblems={onProblems}
          isBookmarked={isBookmarked}
          isPinned={isPinned}
        />
      </motion.div>
    </div>
  );
};

const Topics = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('beginner');
  const [bookmarkedTopics, setBookmarkedTopics] = useState(new Set());
  const [pinnedTopics, setPinnedTopics] = useState(new Set());
  const [topicOrder, setTopicOrder] = useState({
    beginner: [],
    intermediate: [],
    advanced: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedActions = localStorage.getItem('algo_topicActions');
      const savedOrder = localStorage.getItem('topicOrder');

      if (savedActions) {
        const actions = JSON.parse(savedActions);
        if (actions.bookmarks && Array.isArray(actions.bookmarks)) {
          setBookmarkedTopics(new Set(actions.bookmarks.filter(id => id != null)));
        }
        if (actions.pinned && Array.isArray(actions.pinned)) {
          setPinnedTopics(new Set(actions.pinned.filter(id => id != null)));
        }
      }
      
      if (savedOrder) {
        setTopicOrder(JSON.parse(savedOrder));
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/topics');
      const fetchedTopics = response.data;
      setTopics(fetchedTopics);

      // Initialize topic order if not exists
      if (topicOrder.beginner.length === 0 && topicOrder.intermediate.length === 0 && topicOrder.advanced.length === 0) {
        const newOrder = {
          beginner: fetchedTopics.filter(t => t.difficulty === 'beginner').map(t => t._id),
          intermediate: fetchedTopics.filter(t => t.difficulty === 'intermediate').map(t => t._id),
          advanced: fetchedTopics.filter(t => t.difficulty === 'advanced').map(t => t._id),
        };
        setTopicOrder(newOrder);
        localStorage.setItem('topicOrder', JSON.stringify(newOrder));
      }
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

  const handleDragEnd = (event, difficulty) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = topicOrder[difficulty].indexOf(active.id);
      const newIndex = topicOrder[difficulty].indexOf(over.id);

      const newOrder = {
        ...topicOrder,
        [difficulty]: arrayMove(topicOrder[difficulty], oldIndex, newIndex),
      };

      setTopicOrder(newOrder);
      localStorage.setItem('topicOrder', JSON.stringify(newOrder));
      toast.success('Topic order updated!');
    }
  };

  const handleBookmark = (topicId, shouldBookmark) => {
    if (!topicId) return;
    
    const newBookmarks = new Set(bookmarkedTopics);
    if (shouldBookmark) {
      newBookmarks.add(topicId);
    } else {
      newBookmarks.delete(topicId);
    }
    setBookmarkedTopics(newBookmarks);
    
    // Save to unified localStorage structure
    const savedActions = localStorage.getItem('algo_topicActions');
    const actions = savedActions ? JSON.parse(savedActions) : { bookmarks: [], pinned: [] };
    actions.bookmarks = Array.from(newBookmarks).filter(id => id != null);
    localStorage.setItem('algo_topicActions', JSON.stringify(actions));
    
    toast.success(shouldBookmark ? 'Topic bookmarked' : 'Bookmark removed');
  };

  const handlePin = (topicId, shouldPin) => {
    if (!topicId) return;
    
    const newPins = new Set(pinnedTopics);
    if (shouldPin) {
      newPins.add(topicId);
    } else {
      newPins.delete(topicId);
    }
    setPinnedTopics(newPins);
    
    // Save to unified localStorage structure
    const savedActions = localStorage.getItem('algo_topicActions');
    const actions = savedActions ? JSON.parse(savedActions) : { bookmarks: [], pinned: [] };
    actions.pinned = Array.from(newPins).filter(id => id != null);
    localStorage.setItem('algo_topicActions', JSON.stringify(actions));
    
    toast.success(shouldPin ? 'Topic pinned' : 'Pin removed');
  };

  const handleQuiz = (topicTitle) => {
    if (!topicTitle) return;
    const encodedTitle = encodeURIComponent(topicTitle);
    navigate(`/user/tests?topic=${encodedTitle}`);
  };

  const handleProblems = (topicTitle) => {
    if (!topicTitle) return;
    const encodedTitle = encodeURIComponent(topicTitle);
    navigate(`/user/practice-questions?topic=${encodedTitle}`);
  };

  const getOrderedTopics = (difficulty) => {
    const filtered = topics.filter(topic => topic.difficulty === difficulty);
    const order = topicOrder[difficulty] || [];
    
    // Sort by order, then by title for topics not in order
    return filtered.sort((a, b) => {
      const aIndex = order.indexOf(a._id);
      const bIndex = order.indexOf(b._id);
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const filteredTopics = (difficulty) => {
    return getOrderedTopics(difficulty);
  };

  const renderTopicList = (difficulty) => {
    const topicsList = filteredTopics(difficulty);
    const topicIds = topicsList.map(t => t._id);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => handleDragEnd(event, difficulty)}
      >
        <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {topicsList.map((topic, index) => (
                <SortableTopicItem
                  key={topic._id}
                  topic={topic}
                  index={index}
                  onBookmark={handleBookmark}
                  onPin={handlePin}
                  onQuiz={handleQuiz}
                  onProblems={handleProblems}
                  isBookmarked={bookmarkedTopics.has(topic._id)}
                  isPinned={pinnedTopics.has(topic._id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  if (loading && topics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <RefreshCw className="w-8 h-8 text-blue-600" />
              </motion.div>
              <p className="text-xl text-gray-600">Loading topics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && topics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <p className="text-xl text-red-600">{error}</p>
              <button
                onClick={fetchTopics}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Learning Topics</h1>
                <p className="text-gray-600 mt-1">Explore and master data structures & algorithms</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchTopics}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </motion.button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
                  <p className="text-sm text-gray-600">Total Topics</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{bookmarkedTopics.size}</p>
                  <p className="text-sm text-gray-600">Bookmarked</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pinnedTopics.size}</p>
                  <p className="text-sm text-gray-600">Pinned</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-md mb-6">
              <TabsTrigger
                value="beginner"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  <span>🌱</span>
                  Beginner ({filteredTopics('beginner').length})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="intermediate"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-500 data-[state=active]:text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  <span>⚡</span>
                  Intermediate ({filteredTopics('intermediate').length})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  <span>🔥</span>
                  Advanced ({filteredTopics('advanced').length})
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beginner" className="mt-0">
              {filteredTopics('beginner').length > 0 ? (
                renderTopicList('beginner')
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No beginner topics available
                </div>
              )}
            </TabsContent>

            <TabsContent value="intermediate" className="mt-0">
              {filteredTopics('intermediate').length > 0 ? (
                renderTopicList('intermediate')
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No intermediate topics available
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="mt-0">
              {filteredTopics('advanced').length > 0 ? (
                renderTopicList('advanced')
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No advanced topics available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Drag and Drop Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span>💡</span>
            <span>Drag and drop topics to reorder them</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Topics;
