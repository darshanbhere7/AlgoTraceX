import React from 'react';
import { motion } from 'framer-motion';

const StreakHeatmap = ({ data = [], range = 60 }) => {
  const dataMap = data.reduce((acc, entry) => {
    if (entry?.date) {
      acc[entry.date] = entry.count || 0;
    }
    return acc;
  }, {});

  const days = [];
  const today = new Date();
  for (let i = range - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    days.push({
      date: key,
      count: dataMap[key] || 0,
    });
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  const getIntensity = (count) => {
    if (count === 0) {
      return 'bg-gray-100 dark:bg-neutral-800 border border-gray-200/60 dark:border-neutral-700/60';
    }
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return 'bg-emerald-200 dark:bg-emerald-900 border border-emerald-200/60 dark:border-emerald-900/60';
    if (intensity < 0.5) return 'bg-emerald-400 dark:bg-emerald-800 border border-emerald-400/60 dark:border-emerald-800/60';
    if (intensity < 0.75) return 'bg-emerald-600 dark:bg-emerald-700 border border-emerald-600/60 dark:border-emerald-700/60';
    return 'bg-emerald-700 dark:bg-emerald-600 border border-emerald-700/60 dark:border-emerald-600/60';
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[420px]">
        <div className="grid grid-cols-7 gap-1 p-3 rounded-md bg-gray-50 dark:bg-neutral-900 shadow-sm border border-gray-100 dark:border-neutral-800">
          {days.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`w-3.5 h-3.5 rounded ${getIntensity(day.count)} cursor-pointer hover:scale-125 transition-transform relative group`}
              title={`${day.date}: ${day.count} activities`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {day.count > 0 && (
                  <span className="text-[6px] text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 text-xs text-gray-600 dark:text-gray-300 px-3">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-100 dark:bg-neutral-800 border border-gray-200/60 dark:border-neutral-700/60 rounded" />
            <div className="w-2 h-2 bg-emerald-200 dark:bg-emerald-900 rounded" />
            <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-800 rounded" />
            <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-700 rounded" />
            <div className="w-2 h-2 bg-emerald-700 dark:bg-emerald-600 rounded" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default StreakHeatmap;
