import { RefObject, useEffect } from 'react';
import { requestTaskFocusAction } from '../actions';
import { useUIStore } from './index';

/** Focuses the task's card when focus is requested for it */
export const useTaskFocusRequest = (
  taskId: string,
  ref: RefObject<HTMLElement | null>,
) => {
  const taskToFocus = useUIStore((state) => state.taskToFocus);

  useEffect(() => {
    if (taskToFocus !== taskId || !ref.current) return;
    ref.current.focus();
    requestTaskFocusAction(null);
  }, [taskToFocus, taskId, ref]);
};
