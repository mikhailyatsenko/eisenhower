import { MatrixKey } from './quadrantTypes';

export interface TaskState {
  tasks: Record<MatrixKey, string[]>;

  addTask: (quadrantKey: MatrixKey, task: string) => void;

  moveTaskToQuadrant: (
    task: string,
    fromQuadrant: MatrixKey,
    toQuadrant: MatrixKey,
  ) => void;

  reorderTasks: (
    quadrantKey: MatrixKey,
    startIndex: number,
    endIndex: number,
  ) => void;
}
