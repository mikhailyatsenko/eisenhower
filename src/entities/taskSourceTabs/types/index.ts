import { StateKey } from '@/shared/stores/tasksStore';

export interface TaskSourceTabsProps {
  switchToFirebaseTasks: () => void;
  switchToLocalTasks: () => void;
  currentSource: StateKey;
}
