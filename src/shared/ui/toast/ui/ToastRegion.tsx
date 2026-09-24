'use client';

import { toAnnouncement } from '../lib';
import { useToastStore } from '../model';
import { ToastCard } from './ToastCard';

/**
 * The page's single toast slot. The status region stays in the DOM so screen
 * readers track it, and the slot's place in the markup is its place in the
 * Tab order. The region holds only the announcement: the visible card and its
 * button sit next to it, so "Undo" isn't read twice.
 */
export const ToastRegion = () => {
  const toast = useToastStore((state) => state.toast);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div role="status" aria-label="Notifications" className="sr-only">
        {/* key: a replacing toast with the same text is announced again */}
        {toast && <span key={toast.id}>{toAnnouncement(toast)}</span>}
      </div>
      {/* key: a replacing toast starts its own 6 seconds */}
      {toast && <ToastCard key={toast.id} toast={toast} />}
    </div>
  );
};
