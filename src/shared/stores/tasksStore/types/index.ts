import type { MatrixKey } from '@/shared/consts';
import { LOCAL_STATE_KEY, CLOUD_STATE_KEY } from '../consts';

export type { MatrixKey };

export interface Task {
  id: string;
  text: string;
  createdAt: Date;
  dueDate?: Date;
  order?: number;
  completed?: boolean;
  completedAt?: Date;
  quadrantKey?: MatrixKey;
}
export type Tasks = Record<MatrixKey, Task[]>;

export type StateKey = typeof LOCAL_STATE_KEY | typeof CLOUD_STATE_KEY;

export interface TaskState {
  localTasks: Tasks;
  firebaseTasks: Tasks;
  localCompletedTasks: Task[];
  firebaseCompletedTasks: Task[];
  activeState: StateKey;
  /** The signed-in user's cloud Matrix has arrived, from the server or the device cache */
  isCloudLoaded: boolean;
}

/** Puts things back as they were before an action */
export type Revert = () => Promise<void>;
