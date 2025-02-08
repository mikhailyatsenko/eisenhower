import { TaskPriorityKey } from './quadrantTypes';

export interface TaskState {
  tasks: Record<TaskPriorityKey, string[]>;
  addTask: (priority: TaskPriorityKey, task: string) => void;
}
