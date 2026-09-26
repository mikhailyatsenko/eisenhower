import { useEffect, useRef } from 'react';

import { useIsTouchScreen } from '@/shared/hooks';
import { MatrixKey } from '@/shared/stores/tasksStore';
import {
  setAddTaskTabStopAction,
  requestAddTaskButtonFocusAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { ADD_TASK_BUTTON_ATTRIBUTE } from '../../../lib';
import { ADD_TASK_BUTTON_STYLES } from '../consts';

interface AddTaskButtonProps {
  quadrant: MatrixKey;
  /** Id of the quadrant's title, which tells the buttons apart */
  titleId: string;
  /** The matrix's one Tab stop */
  isTabStop: boolean;
  /** Opens the add field; Esc from it comes back to this button */
  onClick: (button: HTMLElement) => void;
}

/**
 * "Add a task" in an empty quadrant: its text says a click adds a task. It is
 * named by that text (WCAG 2.5.3) and described by the quadrant's title. The
 * keyboard reaches it like a task: the arrows, Tab into an empty matrix, the
 * focus after the quadrant's last task is gone. With the focus on it no task
 * is selected.
 */
export const AddTaskButton: React.FC<AddTaskButtonProps> = ({
  quadrant,
  titleId,
  isTabStop,
  onClick,
}) => {
  const isTouchScreen = useIsTouchScreen();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isFocusRequested = useUIStore(
    (state) => state.addTaskButtonToFocus === quadrant,
  );

  useEffect(() => {
    if (!isFocusRequested || !buttonRef.current) return;
    buttonRef.current.focus();
    requestAddTaskButtonFocusAction(null);
  }, [isFocusRequested]);

  return (
    <button
      ref={buttonRef}
      type="button"
      tabIndex={isTabStop ? 0 : -1}
      aria-describedby={titleId}
      {...{ [ADD_TASK_BUTTON_ATTRIBUTE]: quadrant }}
      onFocus={() => setAddTaskTabStopAction(quadrant)}
      onClick={(event) => onClick(event.currentTarget)}
      className={ADD_TASK_BUTTON_STYLES}
    >
      {isTouchScreen ? 'Tap to add' : 'Click to add a task'}
    </button>
  );
};
