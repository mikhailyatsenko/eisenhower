'use client';

import { flushSync } from 'react-dom';
import { revealCompletedSection } from '@/entities/matrixLayout';
import { setCompletedExpandedAction } from '@/shared/stores/uiStore';
import { switchView } from '../model';

interface CompletedEntryProps {
  /** Completed tasks; the line isn't there without them */
  count: number;
}

/**
 * "✓ N completed →" under the matrix: List view opens on the Completed
 * section, expanded for good, with the focus on its header. The page goes
 * to the section, not to the top.
 */
export const CompletedEntry: React.FC<CompletedEntryProps> = ({ count }) => {
  const handleClick = () => {
    // The section has to be on the page to scroll to it and focus it
    flushSync(() => {
      switchView('list', { scrollsToTop: false });
      setCompletedExpandedAction(true);
    });
    revealCompletedSection();
  };

  return (
    <div className="mt-2 flex justify-center">
      <button
        type="button"
        onClick={handleClick}
        className="min-h-11 cursor-pointer rounded-md px-3 text-sm font-medium text-gray-700 hover:bg-black/5 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:outline-none dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:ring-indigo-300"
      >
        <span aria-hidden="true">✓ </span>
        {count} completed
        <span aria-hidden="true"> →</span>
      </button>
    </div>
  );
};
