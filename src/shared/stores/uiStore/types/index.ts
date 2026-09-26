import { MatrixKey } from '../../tasksStore/types';

/** The inline add field: one on the page, at the end of a quadrant's list */
export interface InlineAdd {
  quadrant: MatrixKey;
  /** Moves with the field when it opens in another quadrant */
  text: string;
  /** Counts the opens: each one, in the same quadrant too, focuses the field */
  openCount: number;
  /** This open was a click on empty space: what the header hint teaches */
  isByEmptySpace: boolean;
}

export type ViewMode = 'matrix' | 'list';

export interface UIState {
  selectedCategory: MatrixKey;
  taskInputText: string;
  recentlyAddedQuadrant: MatrixKey | null;
  isFormOpened: boolean;
  viewMode: ViewMode;
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
  /**
   * The empty quadrant whose "Add a task" had the focus last, after any task
   * was selected: the matrix's Tab stop while the quadrant stays empty
   */
  addTaskTabStop: MatrixKey | null;
  /** Empty quadrant whose "Add a task" takes focus once it's rendered */
  addTaskButtonToFocus: MatrixKey | null;
  /**
   * A task was once added by a click on empty space: the header hint "click
   * empty space to add" is gone for good. Stored on the device, not synced.
   */
  hasAddedByEmptySpace: boolean;
}
