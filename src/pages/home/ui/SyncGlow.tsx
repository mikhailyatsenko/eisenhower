'use client';

import { useTaskStore } from '@/shared/stores/tasksStore';

// Gradient at the top edge while a user is signed in: the Matrix's Storage
// is the cloud
export const SyncGlow = () => {
  const isInCloud = useTaskStore((state) => state.isInCloud);

  return (
    <div
      className={`fixed inset-0 z-[11] h-10 w-1/2 translate-x-1/2 rounded-full blur-2xl transition-all duration-500 [background:_linear-gradient(45deg,_#ffd324,_#ff4f4f,_#9e71ff)] ${
        isInCloud
          ? '-translate-y-1/2 opacity-100'
          : '-translate-y-full opacity-0'
      }`}
    ></div>
  );
};
