import React, { useMemo, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Leaf, Zap, Flame } from 'lucide-react';
import QuickActions from './QuickActions';
import TopicRoadmap from './TopicRoadmap';
import { generateLearningInsight, extractMicroConcepts, truncateDescription } from '@/utils/topicUtils';
import { cn } from '@/lib/utils';

const DIFFICULTY_CONFIG = {
  beginner: {
    icon: Leaf,
    gradient: 'from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/60 dark:via-neutral-950 dark:to-emerald-900/50',
    border: 'border-l-4 border-emerald-200 dark:border-emerald-500/40',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-100 dark:border-emerald-800/60',
    iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/60',
    iconColor: 'text-emerald-600 dark:text-emerald-200',
    bulletColor: 'text-emerald-500 dark:text-emerald-200',
    insightBg: 'bg-emerald-50/80 dark:bg-emerald-950/50',
    insightBorder: 'border-emerald-200 dark:border-emerald-700/70',
    insightText: 'text-emerald-800 dark:text-emerald-100'
  },
  intermediate: {
    icon: Zap,
    gradient: 'from-amber-50 via-white to-yellow-50 dark:from-amber-950/55 dark:via-neutral-950 dark:to-yellow-900/40',
    border: 'border-l-4 border-amber-200 dark:border-amber-500/40',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:border-amber-800/60',
    iconBg: 'bg-amber-100/80 dark:bg-amber-900/60',
    iconColor: 'text-amber-600 dark:text-amber-200',
    bulletColor: 'text-amber-500 dark:text-amber-200',
    insightBg: 'bg-amber-50/80 dark:bg-amber-950/50',
    insightBorder: 'border-amber-200 dark:border-amber-700/70',
    insightText: 'text-amber-800 dark:text-amber-100'
  },
  advanced: {
    icon: Flame,
    gradient: 'from-rose-50 via-white to-orange-50 dark:from-rose-950/55 dark:via-neutral-950 dark:to-orange-900/40',
    border: 'border-l-4 border-rose-200 dark:border-rose-500/40',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-100 dark:border-rose-800/60',
    iconBg: 'bg-rose-100/80 dark:bg-rose-900/60',
    iconColor: 'text-rose-600 dark:text-rose-200',
    bulletColor: 'text-rose-500 dark:text-rose-200',
    insightBg: 'bg-rose-50/80 dark:bg-rose-950/50',
    insightBorder: 'border-rose-200 dark:border-rose-700/70',
    insightText: 'text-rose-800 dark:text-rose-100'
  }
};

const TopicCardComponent = ({ 
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
        className={cn(
          'relative overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl bg-white/95 dark:bg-neutral-900/80',
          config.border
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-0 opacity-80 dark:opacity-35 bg-gradient-to-br',
            config.gradient
          )}
          aria-hidden="true"
        />
        <CardContent className="relative p-6 space-y-4 rounded-2xl border border-white/70 dark:border-white/5 bg-white/85 dark:bg-neutral-950/70 backdrop-blur-sm shadow-[0_20px_45px_rgba(15,23,42,0.08)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.55)]">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn('p-2 rounded-lg shadow-inner', config.iconBg)}>
                <Icon className={cn('w-5 h-5', config.iconColor)} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{topic.title}</h3>
                <Badge className={cn('border', config.badgeClass)}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{summary}</p>

          {/* Key Concepts */}
          {keyConcepts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Key Concepts:</p>
              <ul className="space-y-1.5">
                {keyConcepts.map((concept, idx) => (
                  <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <span className={cn('mt-1 text-base', config.bulletColor)}>•</span>
                    <span className="flex-1">{concept}</span>
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
                <div className="mt-2 p-4 rounded-lg border border-gray-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-inner">
                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
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
              className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
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
          <div
            className={cn(
              'p-3 rounded-lg border-l-4 shadow-sm transition-colors',
              config.insightBg,
              config.insightBorder
            )}
          >
            <p className={cn('text-xs font-semibold mb-1', config.insightText)}>Learning Insight</p>
            <p className={cn('text-xs leading-relaxed', config.insightText)}>{learningInsight}</p>
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

export default memo(TopicCardComponent);

