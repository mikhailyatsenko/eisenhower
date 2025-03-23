import { MatrixKey } from '../../tasksStore/types';

export interface UIState {
  selectedCategory: MatrixKey;
  taskInputText: string;
  recentlyAddedQuadrant: MatrixKey | null;
}
