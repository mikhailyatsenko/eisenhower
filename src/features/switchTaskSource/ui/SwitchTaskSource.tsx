'use client';

// import { getActiveState } from '@/entities/Matrix';
import {
  // useTaskStore,
  switchToFirebaseTasks,
  switchToLocalTasks,
} from '@/entities/Matrix';
import { TaskSourceTabs } from '@/entities/taskSourceTabs';
import { useUserStore } from '@/entities/user';

export const SwitchTaskSource = () => {
  // const activeState = useTaskStore(getActiveState);

  const { user } = useUserStore();

  if (!user) {
    return null;
  }

  return (
    <TaskSourceTabs
      switchToFirebaseTasks={switchToFirebaseTasks}
      switchToLocalTasks={switchToLocalTasks}
    />
  );
};
