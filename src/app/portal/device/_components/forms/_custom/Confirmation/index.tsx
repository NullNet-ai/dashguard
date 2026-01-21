import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Loader } from '~/components/ui/loader';

export default function CustomConfirmationDetails() {
  const instructions = [
    {
      icon: CheckIcon,
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      icon: CheckIcon,
      message:
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
      icon: CheckIcon,
      message:
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    },
    {
      icon: CheckIcon,
      message:
        'Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.',
    },
  ];

  return (
     <div className="flex min-h-[calc(100vh-400px)] flex-col">
        <div className='flex-1 h-full items-center justify-center flex flex-col '>
          <div className="flex flex-col items-center gap-4 ">
          {/* Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          </div>
          
          {/* Connecting text with animated dots */}
          <div className="flex items-center gap-1 text-gray-700 text-lg font-medium">
            <span>Waiting for connection</span>
            <span className="flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
            </span>
          </div>
        </div>
        </div>
      </div>
  );
}
