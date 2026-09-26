'use client';

import { useEffect, useRef, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

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

  // The page slides under the open bubble: close it instead
  const handleScroll = useCallback(() => {
    setIsOpen(false);
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
    // Holds the closed button's place in the header; the open bubble grows
    // from its right corner over the page
    <div ref={ref} className="relative h-11 shrink-0">
      <div
        className={twMerge(
          'overflow-hidden transition-all duration-300',
          isOpen
            ? 'absolute top-0 right-0 h-90 w-[min(22.5rem,calc(100vw-1rem))] rounded-bl-3xl bg-indigo-200/95 p-5 shadow-lg [clip-path:_circle(100%_at_100%_0)] dark:bg-indigo-950/95'
            : 'h-11 min-w-11 rounded-lg bg-indigo-200/95 hover:bg-indigo-300/95 dark:bg-indigo-950/95 dark:hover:bg-indigo-900/95',
        )}
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
            className="flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-900 focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:outline-none focus-visible:ring-inset dark:text-gray-100 dark:focus-visible:ring-indigo-300"
          >
            {iconWhenClosed}
          </button>
        )}
      </div>
    </div>
  );
};
