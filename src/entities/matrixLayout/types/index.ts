import { MatrixKey } from '@/shared/stores/tasksStore';

/**
 * What a quadrant holds besides its tasks. The matrix widget fills these in
 * with the add feature, which the quadrant doesn't know.
 */
export interface QuadrantSlots {
  /** A button after the title, the "+" */
  headerAction: (quadrant: MatrixKey) => React.ReactNode;
  /** After the last task, in the scrolling area: the inline add field */
  listEnd: (quadrant: MatrixKey) => React.ReactNode;
  /**
   * Opens the add field in the quadrant: on a click on empty space with no
   * task selected, and from "Add a task", which Esc then comes back to
   */
  openAddField: (quadrant: MatrixKey, returnFocus?: HTMLElement) => void;
}
