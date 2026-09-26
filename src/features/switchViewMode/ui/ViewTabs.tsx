'use client';

import { useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { setViewModeAction, useUIStore } from '@/shared/stores/uiStore';
import { ViewIcon } from '../components/ViewIcon';
import { VIEW_PANEL_ID, VIEWS } from '../consts';
import { viewTabId } from '../lib';

/**
 * "Matrix | List" as WAI-ARIA tabs with automatic activation: only the
 * selected tab is in the Tab order, ←→ switch the view at once.
 */
export const ViewTabs = () => {
  const viewMode = useUIStore((state) => state.viewMode);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + VIEWS.length) % VIEWS.length;
    setViewModeAction(VIEWS[next].mode);
    tabsRef.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="View"
      className="flex shrink-0 gap-0.5 rounded-xl bg-gray-100 p-0.5 dark:bg-gray-800"
    >
      {VIEWS.map(({ mode, label }, index) => {
        const isSelected = mode === viewMode;
        return (
          <button
            key={mode}
            ref={(element) => {
              tabsRef.current[index] = element;
            }}
            type="button"
            role="tab"
            id={viewTabId(mode)}
            aria-selected={isSelected}
            aria-controls={VIEW_PANEL_ID}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => setViewModeAction(mode)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={twMerge(
              'flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:outline-none dark:text-gray-300 dark:hover:text-white dark:focus-visible:ring-indigo-300',
              isSelected &&
                'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white',
            )}
          >
            <ViewIcon mode={mode} />
            {/* Icons only on a phone, the label stays the tab's name */}
            <span className="sr-only sm:not-sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
