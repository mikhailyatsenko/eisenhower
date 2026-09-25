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
 * The "+" in a quadrant's header: opens the inline add field there. Out of
 * the Tab order, the matrix stays one Tab stop.
 */
export const QuadrantAddButton: React.FC<QuadrantAddButtonProps> = ({
  quadrant,
}) => (
  <button
    type="button"
    id={addButtonId(quadrant)}
    tabIndex={-1}
    aria-label={`Add a task to ${QUADRANTS[quadrant].title}`}
    onClick={() => openInlineAddAction(quadrant)}
    className={ADD_BUTTON_STYLES}
  >
    <svg
      aria-hidden="true"
      className="size-5 sm:size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  </button>
);
