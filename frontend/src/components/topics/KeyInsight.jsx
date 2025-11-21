import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const KEY_INSIGHTS = {
  beginner: [
    "70% of beginner problems follow pattern X—master that first.",
    "Start with understanding the problem structure before coding.",
    "Focus on one concept at a time—don't rush the fundamentals.",
    "Practice pattern recognition—most problems repeat similar structures."
  ],
  intermediate: [
    "Optimization comes after correctness—solve first, optimize later.",
    "Time complexity matters—learn to analyze before implementing.",
    "Break complex problems into smaller, manageable sub-problems.",
    "Master data structure selection—it's the key to efficiency."
  ],
  advanced: [
    "Think in algorithms, not just code—understand the mathematical foundation.",
    "Edge cases define expert solutions—always consider boundary conditions.",
    "Space-time tradeoffs are crucial—know when to optimize what.",
    "Advanced patterns require deep understanding—master fundamentals first."
  ]
};

const KeyInsight = ({ difficulty, topicTitle }) => {
  const insights = KEY_INSIGHTS[difficulty] || KEY_INSIGHTS.beginner;
  const randomInsight = insights[Math.floor(Math.random() * insights.length)];

  const difficultyColors = {
    beginner: 'bg-green-50 border-green-200 text-green-800',
    intermediate: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    advanced: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mt-4 p-3 rounded-lg border-l-4 ${difficultyColors[difficulty]} flex items-start gap-2`}
    >
      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold mb-1">Key Insight</p>
        <p className="text-xs leading-relaxed">{randomInsight}</p>
      </div>
    </motion.div>
  );
};

export default KeyInsight;

