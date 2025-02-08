import { TaskPriorityKey } from './quadrantTypes';

export interface TaskState {
  task: Record<TaskPriorityKey, string[]>;
  addTask: (priority: TaskPriorityKey, task: string) => void;
}
