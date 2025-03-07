import { MatrixQuadrants } from '../consts/taskMatrixConsts';

export type MatrixKey = keyof typeof MatrixQuadrants;

export interface Task {
  id: string;
  text: string;
  createdAt: Date;
}

export interface FirestoreTaskData {
  id: string;
  text: string;
  createdAt: string;
  quadrantKey: MatrixKey;
  userId: string;
}

export type Tasks = Record<MatrixKey, Task[]>;
