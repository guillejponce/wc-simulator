import React from 'react';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`
        w-full px-3 py-2
        border border-[var(--border-color)] rounded-md
        bg-white text-[var(--text-primary)]
        placeholder:text-[var(--text-secondary)]
        focus:outline-none focus:ring-2 focus:ring-[var(--wc-blue)] focus:border-transparent
        disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-disabled)]
        ${className}
      `}
      {...props}
    />
  );
} 