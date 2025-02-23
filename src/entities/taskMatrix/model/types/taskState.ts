import { MatrixKey, Task } from './quadrantTypes';

export type Tasks = Record<MatrixKey, Task[]>;

export interface TaskState {
  tasks: Tasks;
  selectedCategory: MatrixKey;
  taskText: string;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}
