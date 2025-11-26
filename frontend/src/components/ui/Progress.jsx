import React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

const clampValue = (value = 0) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  return Math.min(100, Math.max(0, numericValue));
};

const Progress = ({ value = 0, label, className = '', trackClassName = '' }) => {
  const safeValue = clampValue(value);

  return (
    <div
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'relative flex h-3 w-full overflow-hidden rounded-full bg-gray-200/80 dark:bg-neutral-800/80 ring-1 ring-inset ring-gray-200/60 dark:ring-neutral-900/60',
        trackClassName
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 shadow-[0_0_20px_rgba(59,130,246,0.45)]',
          className
        )}
      />
      {label && (
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-white drop-shadow-sm">
          {label}
        </span>
      )}
    </div>
  );
};

export { Progress };