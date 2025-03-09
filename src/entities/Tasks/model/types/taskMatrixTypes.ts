import { MatrixQuadrants } from '../consts/taskMatrixConsts';

export type MatrixKey = keyof typeof MatrixQuadrants;

export interface Task {
  id: string;
  text: string;
  createdAt: Date;
  order?: number;
}

export interface FirestoreTaskData {
  id: string;
  text: string;
  createdAt: string;
  quadrantKey: MatrixKey;
  userId: string;
  order: number;
}

export type Tasks = Record<MatrixKey, Task[]>;
