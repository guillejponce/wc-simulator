import React from 'react';
import { cn } from '../../utils/classNames';

const variantStyles = {
  primary: "bg-blue-600 text-white shadow hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
  success: "bg-green-600 text-white shadow hover:bg-green-700 focus:ring-green-500",
  danger: "bg-red-600 text-white shadow hover:bg-red-700 focus:ring-red-500",
  warning: "bg-yellow-500 text-white shadow hover:bg-yellow-600 focus:ring-yellow-500",
  outline: "bg-transparent border border-gray-300 hover:bg-gray-100 focus:ring-gray-500",
  ghost: "bg-transparent hover:bg-gray-100 focus:ring-gray-500"
};

const sizeStyles = {
  sm: "text-xs px-2.5 py-1.5 rounded",
  md: "text-sm px-4 py-2 rounded-md",
  lg: "text-base px-6 py-3 rounded-md",
  icon: "p-2 rounded-full"
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  asChild = false,
  children,
  ...props
}) {
  const Component = asChild ? React.cloneElement(children, { ...props }) : "button";
  
  if (asChild) {
    return React.cloneElement(children, {
      className: cn(
        "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      ),
      ...props
    });
  }
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 