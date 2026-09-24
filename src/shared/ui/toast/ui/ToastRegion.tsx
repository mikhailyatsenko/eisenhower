'use client';

import { useToastStore } from '../model';
import { ToastCard } from './ToastCard';

/**
 * The page's single toast slot. It stays in the DOM so screen readers track
 * it, and its place in the markup is its place in the Tab order.
 */
export const ToastRegion = () => {
  const toast = useToastStore((state) => state.toast);

  return (
    <div
      role="status"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      {/* key: a replacing toast starts its own 6 seconds */}
      {toast && <ToastCard key={toast.id} toast={toast} />}
    </div>
  );
};
