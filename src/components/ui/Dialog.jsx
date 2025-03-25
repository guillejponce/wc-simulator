import React from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Dialog = ({ open, onClose, children, className, ...props }) => {
  return (
    <HeadlessDialog
      open={open}
      onClose={onClose}
      className={cn("relative z-50", className)}
      {...props}
    >
      <Transition.Child
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      </Transition.Child>

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <HeadlessDialog.Panel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            {children}
          </HeadlessDialog.Panel>
        </Transition.Child>
      </div>
    </HeadlessDialog>
  );
};

const DialogHeader = ({ className, ...props }) => {
  return (
    <div
      className={cn("flex items-center justify-between space-y-0 pb-4", className)}
      {...props}
    />
  );
};

const DialogFooter = ({ className, ...props }) => {
  return (
    <div
      className={cn("flex items-center justify-end space-x-2 pt-4", className)}
      {...props}
    />
  );
};

const DialogTitle = ({ className, ...props }) => {
  return (
    <HeadlessDialog.Title
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
};

const DialogDescription = ({ className, ...props }) => {
  return (
    <HeadlessDialog.Description
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  );
};

const DialogClose = ({ className, ...props }) => {
  return (
    <button
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
};

export {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}; 