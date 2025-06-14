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
        w-full px-3 py-2 border border-gray-300 rounded-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${className}
      `}
      {...props}
    />
  );
};
