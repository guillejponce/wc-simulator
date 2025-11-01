import React from 'react';
import { cn } from '../../utils/classNames';

const variantStyles = {
  default: "bg-wc-dark-gray text-white",
  primary: "bg-wc-gold text-wc-black",
  secondary: "bg-neutral-200 text-neutral-800",
  success: "bg-green-600 text-white",
  warning: "bg-yellow-500 text-white",
  danger: "bg-red-600 text-white",
  info: "bg-sky-500 text-white",
  outline: "bg-transparent border border-wc-gold text-wc-black"
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bebas tracking-wider uppercase",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
} 