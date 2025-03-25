import React from 'react';
import { Tab } from '@headlessui/react';
import { cn } from '../../lib/utils';

const Tabs = Tab.Group;

const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Tab.List
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
        className
      )}
      {...props}
    />
  );
});

TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Tab
      ref={ref}
      className={({ selected }) =>
        cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          selected
            ? "bg-white text-blue-600 shadow-sm"
            : "hover:bg-white/[0.12] hover:text-blue-600",
          className
        )
      }
      {...props}
    />
  );
});

TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Tab.Panel
      ref={ref}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});

TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent }; 