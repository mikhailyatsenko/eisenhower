import { selectTaskAction, useUIStore } from '@/shared/stores/uiStore';

// What isn't empty space: a card, a button (the header's, "+N below") or a field
const NOT_EMPTY_SPACE = '[role="option"], button, input';

/**
 * The click handler of a quadrant or a List view section. A click on its
 * empty space clears the selection, and only that; without a selection
 * it's the area's own, `onEmptySpaceClick` (G).
 */
export const useEmptySpaceClick = () => {
  const hasSelection = useUIStore((state) => state.selectedTaskId !== null);

  return (event: React.MouseEvent, onEmptySpaceClick: () => void) => {
    if ((event.target as HTMLElement).closest(NOT_EMPTY_SPACE)) return;
    if (hasSelection) selectTaskAction(null);
    else onEmptySpaceClick();
  };
};
