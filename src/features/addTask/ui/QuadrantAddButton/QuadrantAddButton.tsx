'use client';

import { QUADRANTS } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { openInlineAddAction } from '@/shared/stores/uiStore';
import { ADD_BUTTON_STYLES } from '../../consts';
import { addButtonId } from '../../lib';

interface QuadrantAddButtonProps {
  quadrant: MatrixKey;
}

/**
 * "+ Add" in a quadrant's header: opens the inline add field there. Named
 * "Add a task to Schedule", starting with the visible "Add" (WCAG 2.5.3). Out
 * of the Tab order, the matrix stays one Tab stop.
 */
export const QuadrantAddButton: React.FC<QuadrantAddButtonProps> = ({
  quadrant,
}) => (
  <button
    type="button"
    id={addButtonId(quadrant)}
    tabIndex={-1}
    onClick={() => openInlineAddAction(quadrant)}
    className={ADD_BUTTON_STYLES}
  >
    {/* Below 360px the cell has room for the word alone */}
    <svg
      aria-hidden="true"
      className="size-4 max-[360px]:hidden sm:size-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
    Add
    <span className="sr-only"> a task to {QUADRANTS[quadrant].title}</span>
  </button>
);
