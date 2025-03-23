'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
      currentSource={activeState}
    />
  );
};
