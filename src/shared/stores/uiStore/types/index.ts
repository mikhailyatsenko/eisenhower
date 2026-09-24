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
  /** The Selected Task in the matrix: at most one, none when null */
  selectedTaskId: string | null;
  /** The latest task to be selected; Tab into the matrix comes back to it */
  lastSelectedTaskId: string | null;
  /** The quadrant open full screen on a phone; the 2×2 grid when null */
  fullScreenQuadrant: MatrixKey | null;
}
