'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useScrollLock } from '../lib/useScrollLock';

export default function Popup({ children }: PropsWithChildren) {
  useScrollLock();

  const [isShowPopup, setIsShowPopup] = useState<boolean | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsShowPopup(!localStorage.getItem('dontShowPopup'));

    const onClose = () => {
      setIsShowPopup(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleDontShowAgain = () => {
    localStorage.setItem('dontShowPopup', 'true');
    setIsShowPopup(false);
  };

  if (isShowPopup === null) {
    return null; // Render nothing while determining the state
  }

  return (
    isShowPopup && (
      <div className="fixed inset-0 z-[19] flex items-center overflow-y-auto bg-black/50">
        <div
          ref={contentRef}
          className="animate-from-bottom-appear text-foreground relative mx-auto flex h-[calc(100dvh-80px)] w-[calc(100vw-80px)] flex-col items-center justify-center overflow-hidden rounded-md bg-gray-200 opacity-0 [animation-duration:_0.2s] dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-5 left-5 z-1 flex h-50 w-50 shrink-0 rotate-10 items-center justify-center rounded-xl bg-red-200 opacity-40">
            <h3 className="text-foreground">Do first</h3>
          </div>
          <div className="absolute bottom-5 left-5 z-1 flex h-50 w-50 shrink-0 rotate-10 items-center justify-center rounded-xl bg-blue-200 opacity-40">
            <h3 className="text-foreground">Schedule</h3>
          </div>
          <div className="absolute top-5 right-5 z-1 flex h-50 w-50 shrink-0 -rotate-10 items-center justify-center rounded-xl bg-amber-200 opacity-40">
            <h3 className="text-foreground">Delegate</h3>
          </div>
          <div className="absolute right-5 bottom-5 z-1 flex h-50 w-50 shrink-0 -rotate-10 items-center justify-center rounded-xl bg-green-200 opacity-40">
            <h3 className="text-foreground">Eliminate</h3>
          </div>
          <div className="relative z-2 overflow-scroll p-6 text-center">
            <h1 className="mb-4 text-2xl font-bold">
              Welcome to Eisenhower Matrix
            </h1>
            <p className="mb-4">
              The Eisenhower Matrix is a time management tool that helps you
              prioritize tasks by urgency and importance, sorting out less
              urgent and important tasks which you should either delegate or not
              spend much time on.
            </p>
            <p className="mb-4">
              This application implements the Eisenhower Matrix approach to help
              you optimize your tasks and improve productivity. You can
              categorize your tasks into four quadrants:
            </p>
            <ul className="mb-4 list-inside list-disc">
              <li>
                <strong>Do First:</strong> Important and Urgent tasks that need
                immediate attention.
              </li>
              <li>
                <strong>Schedule:</strong> Important but Not Urgent tasks that
                you can plan for later.
              </li>
              <li>
                <strong>Delegate:</strong> Not Important but Urgent tasks that
                you can delegate to others.
              </li>
              <li>
                <strong>Eliminate:</strong> Not Important and Not Urgent tasks
                that you can eliminate.
              </li>
            </ul>
            <p className="mb-4">
              Use this tool to manage your tasks effectively and focus on what
              truly matters.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsShowPopup(false)}
                className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Get Started
              </button>
              <button
                onClick={handleDontShowAgain}
                className="mt-4 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Don&apos;t Show Again
              </button>
            </div>
          </div>
          {children}
        </div>
      </div>
    )
  );
}
