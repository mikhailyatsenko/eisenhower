import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';

// grid order: 0 1 / 2 3  (Do First, Schedule / Delegate, Eliminate).
// The row neighbour differs in bit 0, the column one in bit 1.
const neighbourAt = (quadrantKey: MatrixKey, bits: number) =>
  MATRIX_KEYS[MATRIX_KEYS.indexOf(quadrantKey) ^ bits];

/** The other quadrant of the 2×2 row */
export const rowNeighbour = (quadrantKey: MatrixKey) =>
  neighbourAt(quadrantKey, 1);

/** The other quadrants, nearest first: in the row, in the column, across */
export const nearQuadrants = (quadrantKey: MatrixKey) =>
  [1, 2, 3].map((bits) => neighbourAt(quadrantKey, bits));

/** Whether the quadrant is in the left column */
export const isLeftColumn = (quadrantKey: MatrixKey) =>
  MATRIX_KEYS.indexOf(quadrantKey) % 2 === 0;
