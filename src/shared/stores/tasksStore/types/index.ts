import type { MatrixKey } from '@/shared/consts';

export type { MatrixKey };

export interface Task {
  id: string;
  text: string;
  createdAt: Date;
  dueDate?: Date;
  /**
   * False: the deadline is a whole day, stored as its local midnight and due
   * by the end of it. Missing, as on every deadline set before R4: it has a time.
   */
  hasDueTime?: boolean;
  order?: number;
  completed?: boolean;
  completedAt?: Date;
  quadrantKey?: MatrixKey;
}

/** A deadline as the task form sets it; without a time it is a whole day */
export interface Deadline {
  dueDate: Date;
  hasDueTime: boolean;
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
