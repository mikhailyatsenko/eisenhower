'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  useTaskStore,
  switchToFirebaseTasks,
  switchToLocalTasks,
  getActiveState,
} from '@/entities/Tasks';
import { TaskSourceTabs } from '@/entities/taskSourceTabs';
import { useAuth } from '@/shared/api/auth';

export const SwitchTaskSource = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSource = useTaskStore(getActiveState);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const handleTaskSourceSwitch = () => {
      if (!user) {
        switchToLocalTasks();
        router.push('/');
      } else if (searchParams && searchParams.has('cloud')) {
        switchToFirebaseTasks();
      } else {
        switchToLocalTasks();
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
    router.push('?cloud');
  };

  const handleSwitchToLocal = () => {
    router.push('/');
  };

  return (
    <TaskSourceTabs
      switchToFirebaseTasks={handleSwitchToFirebase}
      switchToLocalTasks={handleSwitchToLocal}
      currentSource={currentSource}
    />
  );
};
