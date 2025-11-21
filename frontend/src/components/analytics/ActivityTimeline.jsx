import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const ActivityTimeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activity.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div
              className="rounded-full p-2 flex-shrink-0"
              style={{ backgroundColor: `${activity.color}20` }}
            >
              {Icon && <Icon className="h-5 w-5" style={{ color: activity.color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {activity.date instanceof Date
                  ? `${activity.date.toLocaleDateString()} at ${activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : activity.date}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;

