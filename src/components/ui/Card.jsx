import React from 'react';
import { cn } from '../../utils/classNames';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-md border border-neutral-200 bg-wc-white shadow-md overflow-hidden",
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
        "flex flex-col space-y-1.5 p-4 sm:p-6 border-b border-neutral-200",
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
        "text-xl sm:text-2xl font-bebas tracking-wider leading-none",
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
      className={cn("text-sm text-neutral-500", className)}
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