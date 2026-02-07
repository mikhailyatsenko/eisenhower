'use client';

import { useEffect, useState } from 'react';
import { isTouchDevice } from '@/shared/utils/isTouchDevice';

export interface FloatedButtonProps {
  isNoTasks: boolean;
  active: boolean;
  toggleActive: () => void;
}

export const FloatButton: React.FC<FloatedButtonProps> = ({
  active,
  toggleActive,
  // isNoTasks,
}) => {
  const [bottomOffset, setBottomOffset] = useState(32);

  useEffect(() => {
    if (!isTouchDevice()) return;

    const updateBottomOffset = () => {
      if (!window.visualViewport) return;

      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const keyboardHeight = windowHeight - viewportHeight;

      if (keyboardHeight > 0) {
        setBottomOffset(keyboardHeight + 16 - window.visualViewport.offsetTop);
      } else {
        setBottomOffset(32);
      }
    };

    window.visualViewport?.addEventListener('resize', updateBottomOffset);
    window.visualViewport?.addEventListener('scroll', updateBottomOffset);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateBottomOffset);
      window.visualViewport?.removeEventListener('scroll', updateBottomOffset);
    };
  }, []);

  return (
    <button
      title={`${active ? 'Hide form' : 'Add Task'} `}
      onClick={toggleActive}
      style={{ bottom: bottomOffset }}
      className={`${!active ? 'gradient-flow-button after:content-["Add_task"]' : ''} fixed right-6 z-50 cursor-pointer rounded-full bg-gray-400/30 p-2 duration-150 after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:text-xs after:text-nowrap hover:scale-110 sm:right-10 dark:bg-white/30`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-10 w-10 duration-300 ${active ? 'rotate-[225deg]' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </button>
  );
};
