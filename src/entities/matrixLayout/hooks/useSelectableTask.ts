import { useRef } from 'react';
import {
  selectTaskAction,
  useTaskFocusRequest,
  useUIStore,
} from '@/shared/stores/uiStore';

/**
 * A task's option selects as in the matrix: a click or tap selects it, a
 * second one clears it; focus from Tab or the keys selects it too. It takes
 * the focus when asked, e.g. after Undo.
 */
export const useSelectableTask = (taskId: string) => {
  const isSelected = useUIStore((state) => state.selectedTaskId === taskId);
  const itemRef = useRef<HTMLLIElement | null>(null);
  useTaskFocusRequest(taskId, itemRef);

  // A press focuses the card before its click: the click decides then
  const isPointerFocus = useRef(false);

  const onClick = (event: React.MouseEvent) => {
    // A click on the quadrant's empty space clears the selection
    event.stopPropagation();
    isPointerFocus.current = false;
    selectTaskAction(isSelected ? null : taskId);
  };

  const onPointerDown = () => {
    isPointerFocus.current = true;
  };

  // A press that became a drag never clicks
  const onBlur = () => {
    isPointerFocus.current = false;
  };

  // Focus and selection coincide: Tab or the keys select the focused task
  const onFocus = () => {
    if (isPointerFocus.current) {
      isPointerFocus.current = false;
      return;
    }
    if (!isSelected) selectTaskAction(taskId);
  };

  return {
    isSelected,
    itemRef,
    handlers: { onClick, onPointerDown, onBlur, onFocus },
  };
};
