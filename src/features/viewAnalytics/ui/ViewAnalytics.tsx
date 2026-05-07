'use client';

import React, { useState } from 'react';
import { AnalyticsModal } from './AnalyticsModal';

export const ViewAnalytics = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-1 right-[102px] z-[2] h-12 w-12 cursor-pointer rounded-lg p-2.5 hover:bg-gray-100 sm:right-[120px] dark:hover:bg-gray-700"
        title="View Analytics"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-indigo-600 dark:text-indigo-400"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </button>

      {isOpen && <AnalyticsModal onClose={() => setIsOpen(false)} />}
    </>
  );
};
