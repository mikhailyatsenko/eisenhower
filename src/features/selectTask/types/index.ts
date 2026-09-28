import { MatrixKey, Task } from '@/shared/stores/tasksStore';

/** Where a task sits in the matrix */
export interface TaskLocation {
  task: Task;
  quadrantKey: MatrixKey;
  index: number;
}

/** Where a task sits in Completed, as List view shows it */
export type CompletedLocation = Omit<TaskLocation, 'quadrantKey'>;

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
  restoreTask: (task: Task) => void;
  deleteCompletedTask: (taskId: string) => void;
}

export type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

/** What the toolbar buttons and the matrix keys do to the Selected Task */
export interface TaskActionHandlers {
  onComplete: () => void;
  onEdit: () => void;
  /** Turns the panel into the deadline choices */
  onDeadline: () => void;
  onMove: (toQuadrant: MatrixKey) => void;
  onDelete: () => void;
}
