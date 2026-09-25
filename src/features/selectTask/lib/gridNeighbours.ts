import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';

// grid order: 0 1 / 2 3  (Do First, Schedule / Delegate, Eliminate).
// The row neighbour differs in bit 0.

/** The other quadrant of the 2×2 row */
export const rowNeighbour = (quadrantKey: MatrixKey) =>
  MATRIX_KEYS[MATRIX_KEYS.indexOf(quadrantKey) ^ 1];

/** Whether the quadrant is in the left column */
export const isLeftColumn = (quadrantKey: MatrixKey) =>
  MATRIX_KEYS.indexOf(quadrantKey) % 2 === 0;
