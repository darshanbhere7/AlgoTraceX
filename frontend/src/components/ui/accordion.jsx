import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Accordion = ({ items, defaultOpen = [] }) => {
  const [openItems, setOpenItems] = useState(new Set(defaultOpen));

  const toggleItem = (index) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-semibold text-left">{item.title}</span>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 transition-transform ${
                openItems.has(index) ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {openItems.has(index) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3">{item.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default Accordion;

