import type { MatrixKey, Task, Tasks } from '@/shared/stores/tasksStore';

/** A task document in the `tasks` collection, as stored in Firestore */
export interface FirestoreTaskData {
  id: string;
  text: string;
  createdAt: string;
  dueDate?: string;
  /** Missing on documents written before R4: the deadline has a time */
  hasDueTime?: boolean;
  quadrantKey?: MatrixKey;
  userId: string;
  order: number;
  completed?: boolean;
  completedAt?: string;
}

/** The whole cloud Matrix of a user, as the device sees it right now */
export interface CloudSnapshot {
  /** Active tasks per quadrant, by `order` */
  tasks: Tasks;
  /** Newest first */
  completedTasks: Task[];
  /** Not confirmed by the server: read from the device cache */
  fromCache: boolean;
  /** Holds changes the server hasn't confirmed yet */
  hasPendingWrites: boolean;
}

export type TaskChange =
  | {
      type: 'set';
      task: Task;
      quadrantKey: MatrixKey;
      order: number;
      completed: boolean;
    }
  | { type: 'delete'; id: string };

export type TaskSetChange = Extract<TaskChange, { type: 'set' }>;

/** Why the cloud failed to give or take the Matrix */
export interface SyncFailure {
  /** Firestore error code, e.g. `permission-denied` */
  code: string;
  /** The server refused: trying again won't help */
  isRejected: boolean;
}

export type Unsubscribe = () => void;
