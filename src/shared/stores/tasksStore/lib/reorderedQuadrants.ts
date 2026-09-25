import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey, Tasks } from '../types';

const ids = (tasks: Tasks, key: MatrixKey) =>
  tasks[key].map(({ id }) => id).join();

/** The quadrants whose tasks or their order differ */
export const reorderedQuadrants = (before: Tasks, after: Tasks): MatrixKey[] =>
  MATRIX_KEYS.filter((key) => ids(before, key) !== ids(after, key));
