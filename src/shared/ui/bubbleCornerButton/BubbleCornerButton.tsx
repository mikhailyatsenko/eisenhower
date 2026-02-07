'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface BubbleCornerButtonProps {
  children: React.ReactNode;
  iconWhenClosed: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const BubbleCornerButton: React.FC<BubbleCornerButtonProps> = ({
  children,
  iconWhenClosed,
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
      data-testid="bubble-corner-button"
      ref={ref}
      className={`fixed top-0 left-0 z-20 overflow-hidden bg-indigo-200/95 transition-all duration-300 [clip-path:_circle(100%_at_0_0)] dark:bg-indigo-950/95 ${isOpen ? 'h-90 w-90 p-5 shadow-lg' : 'h-12 w-12 cursor-pointer hover:h-14 hover:w-14 hover:p-1'} ${isHidden ? '-translate-x-full -translate-y-full' : 'translate-x-0 translate-y-0'}`}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      {isOpen ? (
        children
      ) : (
        <div data-testid="icon-when-closed" className="flex h-full w-full p-2">
          {iconWhenClosed}
        </div>
      )}
    </div>
  );
};
