import React from 'react';
import { motion } from 'framer-motion';
import { Star, Pin, TestTube, FileText, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';

const QuickActions = ({ 
  topicId, 
  topicTitle, 
  onBookmark, 
  onPin, 
  onQuiz,
  onProblems,
  isBookmarked = false, 
  isPinned = false 
}) => {
  const handleBookmark = () => {
    onBookmark?.(topicId, !isBookmarked);
  };

  const handlePin = () => {
    onPin?.(topicId, !isPinned);
  };

  const handleStartQuiz = () => {
    onQuiz?.(topicTitle);
  };

  const handleViewProblems = () => {
    onProblems?.(topicTitle);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            isBookmarked
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
          <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePin}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            isPinned
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
          <span>{isPinned ? 'Pinned' : 'Pin'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartQuiz}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <TestTube className="w-3.5 h-3.5" />
          <span>Quiz</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleViewProblems}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Problems</span>
        </motion.button>
      </div>
    </div>
  );
};

export default QuickActions;

