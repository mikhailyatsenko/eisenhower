import { MATRIX_KEYS } from '@/shared/consts';
import { Tasks } from '../types';

export const getEmptyTasksState = (): Tasks => {
  return MATRIX_KEYS.reduce<Tasks>((acc, quadrant) => {
    acc[quadrant] = [];
    return acc;
  }, {} as Tasks);
};
