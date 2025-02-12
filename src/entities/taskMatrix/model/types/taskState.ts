import { MatrixKey } from './quadrantTypes';

export interface TaskState {
  tasks: Record<MatrixKey, string[]>;
  selectedCategory: MatrixKey;
  taskText: string;

  setSelectedCategory: (category: MatrixKey) => void;

  setTaskText: (text: string) => void;

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
