'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { TaskSourceTabs } from '@/entities/taskSourceTabs';
import { useAuth } from '@/shared/api/auth';
import { showToastNotificationByCopyTasks } from '@/shared/lib/toastNotifications';
import {
  useTaskStore,
  switchToFirebaseTasks,
  switchToLocalTasks,
  copyLocalTasksToFirebaseAction,
} from '@/shared/stores/tasksStore';

export const SwitchTaskSource = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeState, localTasks } = useTaskStore();
  const { user, isLoading } = useAuth();
  const initialAuthRedirectDone = useRef(false);
  const [isCopying, setIsCopying] = useState(false);

  const hasLocalTasks = Object.values(localTasks).some(
    (quadrant) => quadrant.length > 0,
  );

  useEffect(() => {
    const handleTaskSourceSwitch = () => {
      // 1. Backward compatibility: redirect ?cloud to /
      if (searchParams?.has('cloud')) {
        if (user) {
          switchToFirebaseTasks();
        } else {
          switchToLocalTasks();
        }
        router.replace('/');
        return;
      }

      if (!user) {
        switchToLocalTasks();
        initialAuthRedirectDone.current = false;
        return;
      }

      // 2. Initial Auth Redirect: When user is first detected (mount or login), force Cloud
      if (user && !initialAuthRedirectDone.current) {
        initialAuthRedirectDone.current = true;
        switchToFirebaseTasks();
        return;
      }
    };

    if (!isLoading) {
      handleTaskSourceSwitch();
    }
  }, [router, searchParams, user, isLoading]);

  if (!user) {
    return null;
  }

  const handleSwitchToFirebase = () => {
    switchToFirebaseTasks();
  };

  const handleSwitchToLocal = () => {
    switchToLocalTasks();
  };

  const handleCopyLocalToCloud = async () => {
    if (isCopying) return;
    setIsCopying(true);
    try {
      await copyLocalTasksToFirebaseAction();
      showToastNotificationByCopyTasks();
      switchToFirebaseTasks();
    } catch (error) {
      console.error('Failed to copy tasks:', error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="fixed top-0 left-1/2 z-[2] -translate-x-1/2">
      <TaskSourceTabs
        switchToFirebaseTasks={handleSwitchToFirebase}
        switchToLocalTasks={handleSwitchToLocal}
        currentSource={activeState}
      />
      {activeState === 'local' && hasLocalTasks && (
        <button
          onClick={handleCopyLocalToCloud}
          disabled={isCopying}
          title="Copy all local tasks to cloud (they will be added to the corresponding quadrants)"
          className="absolute top-1 left-[calc(100%+8px)] flex h-4 items-center rounded-md bg-indigo-500 px-2 text-[10px] whitespace-nowrap text-white hover:bg-indigo-600 disabled:opacity-50"
        >
          {isCopying ? 'Copying...' : 'Copy to Cloud'}
        </button>
      )}
    </div>
  );
};
