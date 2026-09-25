import { MatrixKey } from '../../tasksStore/types';

/** The inline add field: one on the page, at the end of a quadrant's list */
export interface InlineAdd {
  quadrant: MatrixKey;
  /** Moves with the field when it opens in another quadrant */
  text: string;
  /** Counts the opens: each one, in the same quadrant too, focuses the field */
  openCount: number;
}

export interface UIState {
  selectedCategory: MatrixKey;
  taskInputText: string;
  recentlyAddedQuadrant: MatrixKey | null;
  isFormOpened: boolean;
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
  /** Closed when null */
  inlineAdd: InlineAdd | null;
}
