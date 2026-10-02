import { Deadline, MatrixKey } from '../../tasksStore/types';

/** The inline add field: one on the page, at the end of a quadrant's list */
export interface InlineAdd {
  quadrant: MatrixKey;
  /** Moves with the field when it opens in another quadrant */
  text: string;
  /**
   * The deadline strip's pick for the task being typed, null for none.
   * Moves with the text; each task added starts over without one.
   */
  deadline: Deadline | null;
  /** Counts the opens: each one, in the same quadrant too, focuses the field */
  openCount: number;
}

/** The Selected Task's text being edited in the action panel */
export interface TextEdit {
  taskId: string;
  /** What the field holds: the panel writes it, the card shows it */
  draft: string;
}

export type ViewMode = 'matrix' | 'list';

export interface UIState {
  /** A task just dropped there: the quadrant flashes and comes full screen */
  recentlyAddedQuadrant: MatrixKey | null;
  viewMode: ViewMode;
  /**
   * List view sections the user has collapsed. Stored on the device, not
   * synced; an empty section shows open whatever is stored here.
   */
  collapsedSections: MatrixKey[];
  /** The Completed section is expanded; collapsed by default. Stored like collapsedSections. */
  isCompletedExpanded: boolean;
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
  /** Closed when null */
  textEdit: TextEdit | null;
  /** A task is being dragged in the matrix, from its drag start to the drop or cancel */
  isDraggingTask: boolean;
  /**
   * The empty quadrant whose "Add a task" had the focus last, after any task
   * was selected: the matrix's Tab stop while the quadrant stays empty
   */
  addTaskTabStop: MatrixKey | null;
  /** Empty quadrant whose "Add a task" takes focus once it's rendered */
  addTaskButtonToFocus: MatrixKey | null;
}
