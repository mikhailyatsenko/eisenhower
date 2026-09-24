import { MatrixKey } from '@/shared/stores/tasksStore';

/** Moves a task to another quadrant with Undo; the widget passes it in */
export type MoveTask = (
  fromQuadrant: MatrixKey,
  taskId: string,
  toQuadrant: MatrixKey,
  index?: number,
) => void;
