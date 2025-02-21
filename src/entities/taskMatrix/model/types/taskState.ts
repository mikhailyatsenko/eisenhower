import { MatrixKey, Task } from './quadrantTypes';

export interface TaskState {
  tasks: Record<MatrixKey, Task[]>;
  selectedCategory: MatrixKey;
  taskText: string;
  isLoading: boolean; // Add isLoading state

  setSelectedCategory: (category: MatrixKey) => void;

  setTaskText: (text: string) => void;

  addTask: (quadrantKey: MatrixKey, taskText: string) => void;

  editTask: (quadrantKey: MatrixKey, taskId: string, newText: string) => void;

  deleteTask: (quadrantKey: MatrixKey, taskId: string) => void;

  dragEnd: (
    quadrantKey: MatrixKey,
    startIndex: number,
    endIndex: number,
  ) => void;

  dragOverQuadrant: (
    taskId: string,
    fromQuadrant: MatrixKey,
    toQuadrant: MatrixKey,
  ) => void;

  setLoading: (loading: boolean) => void; // Add setLoading action
}
