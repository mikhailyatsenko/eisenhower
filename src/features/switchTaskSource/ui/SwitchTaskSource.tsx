'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { TaskSourceTabs } from '@/entities/taskSourceTabs';
import { useAuth } from '@/shared/api/auth';
import {
  useTaskStore,
  switchToFirebaseTasks,
  switchToLocalTasks,
} from '@/shared/stores/tasksStore';

export const SwitchTaskSource = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { activeState } = useTaskStore();
  const initialAuthRedirectDone = useRef(false);

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

  return (
    <div className="fixed top-0 left-1/2 z-[2] -translate-x-1/2">
      <TaskSourceTabs
        switchToFirebaseTasks={handleSwitchToFirebase}
        switchToLocalTasks={handleSwitchToLocal}
        currentSource={activeState}
      />
    </div>
  );
};
