import { MatrixKey, TaskArea } from '@/shared/stores/tasksStore';
import { MatrixStop } from '../lib/matrixTabStop';

/**
 * What a quadrant holds besides its tasks. The matrix widget fills these in
 * with the add feature, which the quadrant doesn't know.
 */
export interface QuadrantSlots {
  /** A button after the title, the "+ Add" */
  headerAction: (quadrant: MatrixKey) => React.ReactNode;
  /** After the last task, in the scrolling area: the inline add field */
  listEnd: (quadrant: MatrixKey) => React.ReactNode;
  /**
   * Opens the add field in the quadrant: from "Add a task", which Esc then
   * comes back to, or on a click on empty space with no task selected
   */
  openAddField: (quadrant: MatrixKey, returnFocus?: HTMLElement) => void;
}

/** A List view section on screen and where the keyboard stands in it */
export interface ListSection {
  area: TaskArea;
  /** Its tasks, or the "Add a task" of an empty section */
  stops: MatrixStop[];
}

/**
 * What the deadline fields hold: the date as `yyyy-MM-dd`, empty without a
 * deadline, and the time as `HH:mm`, null while the time field is closed
 */
export interface DeadlineInput {
  date: string;
  time: string | null;
}
