import { MatrixQuadrants } from '../consts/taskMatrixConsts';

export type MatrixKey = keyof typeof MatrixQuadrants;

export interface Task {
  id: string;
  text: string;
  createdAt: Date;
}

export type Tasks = Record<MatrixKey, Task[]>;
