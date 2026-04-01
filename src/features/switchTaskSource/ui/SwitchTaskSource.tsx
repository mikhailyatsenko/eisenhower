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
  const { activeState } = useTaskStore();
  const { user, isLoading } = useAuth();
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

      // 2. Initial Auth Redirect: When user is first detected, force Cloud and clean URL
      if (user && !initialAuthRedirectDone.current) {
        initialAuthRedirectDone.current = true;
        switchToFirebaseTasks();
        if (searchParams?.has('local')) {
          router.replace('/');
        }
        return;
      }

      // 3. Manual switch handling: If URL has ?local, ensure we are in local mode
      if (user && searchParams?.has('local') && activeState !== 'local') {
        switchToLocalTasks();
      }

      // 4. Manual switch handling: If URL is clean and we are in local, switch to firebase
      if (user && !searchParams?.has('local') && activeState === 'local') {
        switchToFirebaseTasks();
      }
    };

    if (!isLoading) {
      handleTaskSourceSwitch();
    }
  }, [router, searchParams, user, isLoading, activeState]);

  if (!user) {
    return null;
  }

  const handleSwitchToFirebase = () => {
    switchToFirebaseTasks();
    router.push('/');
  };

  const handleSwitchToLocal = () => {
    switchToLocalTasks();
    router.push('?local');
  };

  return (
    <TaskSourceTabs
      switchToFirebaseTasks={handleSwitchToFirebase}
      switchToLocalTasks={handleSwitchToLocal}
      currentSource={activeState}
    />
  );
};
