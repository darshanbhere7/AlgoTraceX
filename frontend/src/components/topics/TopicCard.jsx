import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Leaf, Zap, Flame } from 'lucide-react';
import QuickActions from './QuickActions';
import TopicRoadmap from './TopicRoadmap';
import { generateLearningInsight, extractMicroConcepts, truncateDescription } from '@/utils/topicUtils';

const DIFFICULTY_CONFIG = {
  beginner: {
    icon: Leaf,
    color: 'green',
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-300',
    badgeClass: 'bg-green-100 text-green-800 border-green-200'
  },
  intermediate: {
    icon: Zap,
    color: 'yellow',
    bgGradient: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-300',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  advanced: {
    icon: Flame,
    color: 'red',
    bgGradient: 'from-red-50 to-orange-50',
    borderColor: 'border-red-300',
    badgeClass: 'bg-red-100 text-red-800 border-red-200'
  }
};

const TopicCard = ({ 
  topic, 
  onBookmark, 
  onPin, 
  onQuiz,
  onProblems,
  isBookmarked = false, 
  isPinned = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const difficulty = topic.difficulty || 'beginner';
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.beginner;
  const Icon = config.icon;

  // Truncate description to summary
  const summary = useMemo(() => {
    return truncateDescription(topic.description || '', 150);
  }, [topic.description]);

  // Prefer curated key concepts but fall back to extracted ones
  const keyConcepts = useMemo(() => {
    if (Array.isArray(topic.keyConcepts) && topic.keyConcepts.length > 0) {
      return topic.keyConcepts;
    }
    return extractMicroConcepts(topic.description || '');
  }, [topic.keyConcepts, topic.description]);

  // Prefer curated insight but fall back to generated one
  const learningInsight = useMemo(() => {
    if (topic.keyInsight && topic.keyInsight.length > 0) {
      return topic.keyInsight;
    }
    return generateLearningInsight(topic.description || '', difficulty);
  }, [topic.keyInsight, topic.description, difficulty]);

  const roadmap = useMemo(() => {
    if (Array.isArray(topic.roadmap) && topic.roadmap.length > 0) {
      return topic.roadmap;
    }
    return undefined;
  }, [topic.roadmap]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative"
    >
      <Card
        className={`overflow-hidden border-l-4 ${config.borderColor} bg-gradient-to-r ${config.bgGradient} hover:shadow-xl transition-all duration-300`}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg bg-white/80 ${config.badgeClass.replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                <Icon className={`w-5 h-5 text-${config.color}-600`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{topic.title}</h3>
                <Badge className={config.badgeClass}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>

          {/* Key Concepts */}
          {keyConcepts.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Key Concepts:</p>
              <ul className="space-y-1">
                {keyConcepts.map((concept, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expandable Full Description */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-white/60 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand/Collapse Button */}
          {topic.description && topic.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Show Less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Show More</span>
                </>
              )}
            </button>
          )}

          {/* Learning Insight */}
          <div className="mt-4 p-3 rounded-lg border-l-4 bg-blue-50 border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-1">Learning Insight</p>
            <p className="text-xs leading-relaxed text-blue-700">{learningInsight}</p>
          </div>

          {/* Topic Roadmap */}
          <TopicRoadmap difficulty={difficulty} roadmap={roadmap} />

          {/* Quick Actions */}
          <QuickActions
            topicId={topic._id}
            topicTitle={topic.title}
            onBookmark={onBookmark}
            onPin={onPin}
            onQuiz={onQuiz}
            onProblems={onProblems}
            isBookmarked={isBookmarked}
            isPinned={isPinned}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopicCard;

