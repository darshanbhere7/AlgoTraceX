import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

const MILESTONES = {
  beginner: ['Basics', 'Patterns', 'Practice', 'Apply'],
  intermediate: ['Concepts', 'Patterns', 'Optimization', 'Advanced Patterns', 'Real-world'],
  advanced: ['Theory', 'Complex Patterns', 'Optimization', 'System Design', 'Expert Level']
};

const TopicRoadmap = ({ difficulty, roadmap }) => {
  const milestones = (Array.isArray(roadmap) && roadmap.length > 0)
    ? roadmap
    : (MILESTONES[difficulty] || MILESTONES.beginner);
  // Show first milestone as in-progress by default
  const completedCount = 0;
  
  const getMilestoneStatus = (index) => {
    if (index < completedCount) return 'completed';
    if (index === completedCount) return 'in-progress';
    return 'pending';
  };

  return (
    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
      <p className="text-xs font-semibold text-gray-700 mb-3">Learning Roadmap</p>
      <div className="flex items-center gap-2 flex-wrap">
        {milestones.map((milestone, index) => {
          const status = getMilestoneStatus(index);
          return (
            <motion.div
              key={milestone}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-1.5"
            >
              {status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : status === 'in-progress' ? (
                <Clock className="w-4 h-4 text-yellow-600" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
              <span
                className={`text-xs font-medium ${
                  status === 'completed'
                    ? 'text-green-700'
                    : status === 'in-progress'
                    ? 'text-yellow-700'
                    : 'text-gray-500'
                }`}
              >
                {milestone}
              </span>
              {index < milestones.length - 1 && (
                <span className="text-gray-300 mx-1">→</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicRoadmap;

