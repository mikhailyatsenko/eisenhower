'use client';

// import { getActiveState } from '@/entities/Matrix';
import {
  useTaskStore,
  switchToFirebaseTasks,
  switchToLocalTasks,
  getActiveState,
} from '@/entities/Matrix';
import { TaskSourceTabs } from '@/entities/taskSourceTabs';

export const SwitchTaskSource = () => {
  // const activeState = useTaskStore(getActiveState);

  const currentSource = useTaskStore(getActiveState);

  return (
    <TaskSourceTabs
      switchToFirebaseTasks={switchToFirebaseTasks}
      switchToLocalTasks={switchToLocalTasks}
      currentSource={currentSource}
    />
  );
};
