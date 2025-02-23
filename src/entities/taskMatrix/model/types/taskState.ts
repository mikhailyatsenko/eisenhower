import { MatrixKey, Task } from './quadrantTypes';

export type Tasks = Record<MatrixKey, Task[]>;

export interface TaskState {
  tasks: Tasks;
  selectedCategory: MatrixKey;
  taskText: string;
  isLoading: boolean;
  // isDragging: boolean;

  setSelectedCategory: (category: MatrixKey) => void;

  setTaskText: (text: string) => void;

  addTask: (quadrantKey: MatrixKey, taskText: string) => void;

  editTask: (quadrantKey: MatrixKey, taskId: string, newText: string) => void;

  deleteTask: (quadrantKey: MatrixKey, taskId: string) => void;

  dragOverQuadrant: (
    taskId: string,
    fromQuadrant: MatrixKey,
    toQuadrant: MatrixKey,
  ) => void;

  dragEnd: (neTasks: Tasks) => void;

  setLoading: (loading: boolean) => void; // Add setLoading action
}
