import type { MatrixKey } from '@/shared/consts';

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

/** A quadrant of the Matrix, or Completed */
export type TaskArea = MatrixKey | 'completed';

export interface TaskState {
  localTasks: Tasks;
  firebaseTasks: Tasks;
  localCompletedTasks: Task[];
  firebaseCompletedTasks: Task[];
  /**
   * The Matrix's Storage is the cloud: a user is signed in and the cloud
   * subscription knows them. Otherwise it is the device.
   */
  isInCloud: boolean;
  /** The signed-in user's cloud Matrix has arrived, from the server or the device cache */
  isCloudLoaded: boolean;
}

/** Puts things back as they were before an action */
export type Revert = () => Promise<void>;
