import { MatrixQuadrants } from '../consts';

export type MatrixKey = keyof typeof MatrixQuadrants;

export interface Task {
  id: string;
  text: string;
  createdAt: Date;
  order?: number;
}
export type Tasks = Record<MatrixKey, Task[]>;

export interface TaskState {
  localTasks: Tasks;
  firebaseTasks: Tasks;
  activeState: 'local' | 'firebase';
}

export interface FirestoreTaskData {
  id: string;
  text: string;
  createdAt: string;
  quadrantKey: MatrixKey;
  userId: string;
  order: number;
}
