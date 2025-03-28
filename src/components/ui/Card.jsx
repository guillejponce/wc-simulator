import React from 'react';
import { cn } from '../../utils/classNames';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 p-4 sm:p-6 border-b border-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "text-lg sm:text-xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn("text-sm text-gray-500", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div
      className={cn("p-4 sm:p-6 pt-0 sm:pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center p-4 sm:p-6 pt-0 sm:pt-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 