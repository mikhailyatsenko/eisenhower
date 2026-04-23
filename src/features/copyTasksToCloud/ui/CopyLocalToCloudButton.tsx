'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/api/auth';
import { showToastNotificationByCopyTasks } from '@/shared/lib/toastNotifications';
import {
  useTaskStore,
  switchToFirebaseTasks,
  copyLocalTasksToFirebaseAction,
} from '@/shared/stores/tasksStore';

interface CopyLocalToCloudButtonProps {
  isExpanded: boolean;
}

export const CopyLocalToCloudButton: React.FC<CopyLocalToCloudButtonProps> = ({
  isExpanded,
}) => {
  const { user } = useAuth();
  const {
    activeState,
    localTasks,
    firebaseTasks,
    localCompletedTasks,
    firebaseCompletedTasks,
  } = useTaskStore();
  const [isCopying, setIsCopying] = useState(false);

  const hasLocalTasks =
    Object.values(localTasks).some((quadrant) => quadrant.length > 0) ||
    localCompletedTasks.length > 0;

  const isCloudEmpty =
    Object.values(firebaseTasks).every((quadrant) => quadrant.length === 0) &&
    firebaseCompletedTasks.length === 0;

  const shouldShow =
    !!user &&
    activeState === 'local' &&
    hasLocalTasks &&
    isCloudEmpty &&
    !isExpanded;

  if (!shouldShow) return null;

  const handleCopyLocalToCloud = async () => {
    if (isCopying) return;
    setIsCopying(true);
    try {
      await copyLocalTasksToFirebaseAction();
      showToastNotificationByCopyTasks();
      switchToFirebaseTasks();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to copy tasks:', error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="mt-8 flex w-full justify-center pb-4">
      <button
        onClick={handleCopyLocalToCloud}
        disabled={isCopying}
        className="flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-600 active:scale-95 disabled:opacity-50"
        title="Copy all local tasks to cloud (they will be added to the corresponding quadrants)"
      >
        {isCopying ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Copying tasks...
          </>
        ) : (
          'Copy all tasks to Cloud'
        )}
      </button>
    </div>
  );
};
