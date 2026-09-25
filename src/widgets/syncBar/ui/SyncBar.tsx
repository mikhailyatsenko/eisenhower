'use client';

import { SyncBarState, useSyncStore } from '@/shared/stores/syncStore';

const TEXTS: Record<Exclude<SyncBarState['kind'], 'hidden'>, string> = {
  offline:
    "You're offline. Changes are saved on this device and will sync when you're back online.",
  syncing: 'Syncing…',
  saved: 'All changes saved',
};

/**
 * Full width right under the top row of buttons: pushes the page down while
 * it shows and stays in view on scroll. One status region for every state,
 * so each is announced once; empty, it takes no space.
 */
export const SyncBar = () => {
  const bar = useSyncStore((state) => state.bar);

  return (
    // Sticks right under the scroll mask (h-12). The margins cancel out: only
    // the text's own height moves the page
    <div
      role="status"
      aria-label="Sync status"
      className="sticky top-12 z-10 mt-12 -mb-12"
    >
      {bar.kind !== 'hidden' && (
        <p className="border-y border-gray-200 bg-gray-100 px-4 py-2 text-center text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
          {TEXTS[bar.kind]}
        </p>
      )}
    </div>
  );
};
