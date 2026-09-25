'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface BubbleCornerButtonProps {
  children: React.ReactNode;
  iconWhenClosed: React.ReactNode;
  /** Accessible name of the closed button, for when its content has no text */
  closedLabel?: string;
  /** The button shown while the bubble is closed */
  closedButtonRef?: React.Ref<HTMLButtonElement>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const BubbleCornerButton: React.FC<BubbleCornerButtonProps> = ({
  children,
  iconWhenClosed,
  closedLabel,
  closedButtonRef,
  isOpen,
  setIsOpen,
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    },
    [setIsOpen],
  );

  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [setIsOpen],
  );

  const handleScroll = useCallback(() => {
    setIsOpen(false);
    setIsHidden(window.scrollY >= 50);
  }, [setIsOpen]);

  useEffect(() => {
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, handleClickOutside, handleEscKey]);

  return (
    <div
      ref={ref}
      // Slid off-screen on scroll: keep it out of the Tab order too
      inert={isHidden}
      className={`fixed top-0 left-0 z-[20] overflow-hidden bg-indigo-200/95 transition-all duration-300 dark:bg-indigo-950/95 ${isOpen ? 'h-90 w-90 p-5 shadow-lg [clip-path:_circle(100%_at_0_0)]' : 'h-12 min-w-12 rounded-br-3xl hover:h-14'} ${isHidden ? '-translate-x-full -translate-y-full' : 'translate-x-0 translate-y-0'}`}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      {isOpen ? (
        children
      ) : (
        // The click bubbles up to the wrapper, which opens the bubble
        <button
          ref={closedButtonRef}
          type="button"
          aria-label={closedLabel}
          className="flex h-full w-full cursor-pointer items-center gap-2 px-3 text-sm font-semibold text-gray-900 focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:outline-none focus-visible:ring-inset dark:text-gray-100 dark:focus-visible:ring-indigo-300"
        >
          {iconWhenClosed}
        </button>
      )}
    </div>
  );
};
