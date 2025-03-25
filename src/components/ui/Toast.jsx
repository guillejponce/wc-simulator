import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Toast = ({ open, onClose, title, description, variant = 'default', className, ...props }) => {
  const variants = {
    default: 'bg-white text-gray-900 border-gray-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    error: 'bg-red-50 text-red-900 border-red-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={cn(
            "fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg",
            variants[variant],
            className
          )}
          {...props}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-1">
              {title && <p className="text-sm font-medium">{title}</p>}
              {description && <p className="text-sm opacity-90">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Toast }; 