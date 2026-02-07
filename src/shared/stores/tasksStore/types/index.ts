import { MatrixQuadrants } from '../consts';
import { LOCAL_STATE_KEY, CLOUD_STATE_KEY } from '../consts';

export type MatrixKey = keyof typeof MatrixQuadrants;

export interface Task {
  id: string;
  text: string;
  createdAt: Date;
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
}

export interface FirestoreTaskData {
  id: string;
  text: string;
  createdAt: string;
  quadrantKey?: MatrixKey;
  userId: string;
  order: number;
  completed?: boolean;
  completedAt?: string;
}
