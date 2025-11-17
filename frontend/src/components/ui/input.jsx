import React from 'react';

import { cn } from "@/lib/utils"

export const Input = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  ...props 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-700
        bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100
        placeholder-gray-500 dark:placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-colors
        ${className}
      `}
      {...props}
    />
  );
};
