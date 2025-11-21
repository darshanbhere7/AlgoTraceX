import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

const AchievementBadge = ({ name, icon: Icon, color = '#8b5cf6', description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 cursor-pointer"
    >
      <div
        className="rounded-full p-3 mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        {Icon ? <Icon className="h-6 w-6" style={{ color }} /> : <Award className="h-6 w-6" style={{ color }} />}
      </div>
      <p className="text-sm font-semibold text-gray-900 text-center">{name}</p>
      {description && <p className="text-xs text-gray-600 text-center mt-1">{description}</p>}
    </motion.div>
  );
};

export default AchievementBadge;

