import { MatrixStop } from './matrixTabStop';

export const isSameStop = (a: MatrixStop, b: MatrixStop) =>
  'taskId' in a
    ? 'taskId' in b && a.taskId === b.taskId
    : 'emptyQuadrant' in b && a.emptyQuadrant === b.emptyQuadrant;
