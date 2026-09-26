import type { TaskChange } from '@/shared/api/cloudMatrix';
import type { Task, Tasks } from '@/shared/stores/tasksStore';

export interface MatrixTasks {
  tasks: Tasks;
  completedTasks: Task[];
}

export interface MigrationPlan {
  /**
   * `none`: every device task is in the cloud already; `move`: the cloud has
   * no tasks but the device's, so they go at once; `ask`: the cloud has its own
   */
  decision: 'none' | 'move' | 'ask';
  /** Tasks to write, active and Completed */
  count: number;
  changes: TaskChange[];
}

/** Whether to add the device's tasks to a cloud with its own */
export interface MigrationQuestion {
  /** Tasks to add, active and Completed */
  count: number;
  add: () => void;
  /** "Don't add": no Migration into this account until sign-out */
  refuse: () => void;
}
