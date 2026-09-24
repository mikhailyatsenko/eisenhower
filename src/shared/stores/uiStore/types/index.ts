import { MatrixKey } from '../../tasksStore/types';

export interface UIState {
  selectedCategory: MatrixKey;
  taskInputText: string;
  recentlyAddedQuadrant: MatrixKey | null;
  isFormOpened: boolean;
  taskInsertIndex: number | null;
  viewMode: 'matrix' | 'list';
  sortField: 'createdAt' | 'importance';
  sortDirection: 'asc' | 'desc';
  /** Task whose card takes focus once it's rendered, e.g. after Undo */
  taskToFocus: string | null;
}
