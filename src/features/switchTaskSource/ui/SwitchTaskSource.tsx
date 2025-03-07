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
import { useUserStore } from '@/entities/user';

export const SwitchTaskSource = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSource = useTaskStore(getActiveState);
  const { user } = useUserStore();

  useEffect(() => {
    if (searchParams && searchParams.has('cloud')) {
      switchToFirebaseTasks();
    } else {
      switchToLocalTasks();
    }
  }, [searchParams]);

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
