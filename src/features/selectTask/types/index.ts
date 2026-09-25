import { MatrixKey, Task } from '@/shared/stores/tasksStore';

/** Where a task sits in the matrix */
export interface TaskLocation {
  task: Task;
  quadrantKey: MatrixKey;
  index: number;
}

/** Undoable task actions; the widget passes them in from features/undo */
export interface TaskActions {
  completeTask: (quadrantKey: MatrixKey, taskId: string) => void;
  deleteTask: (quadrantKey: MatrixKey, taskId: string) => void;
  /** Resolves once the task has moved, or has stayed where it was */
  moveTask: (
    fromQuadrant: MatrixKey,
    taskId: string,
    toQuadrant: MatrixKey,
  ) => Promise<void>;
}

export type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

/** What the toolbar buttons and the matrix keys do to the Selected Task */
export interface TaskActionHandlers {
  onComplete: () => void;
  onEdit: () => void;
  onMove: (toQuadrant: MatrixKey) => void;
  onDelete: () => void;
}
