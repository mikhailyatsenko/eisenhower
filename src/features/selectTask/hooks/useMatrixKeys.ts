import { RefObject, useEffect, useRef } from 'react';
import { firstTaskId } from '@/entities/matrixLayout';
import { MATRIX_KEYS, QUADRANTS } from '@/shared/consts';
import { isTextField } from '@/shared/lib/isTextField';
import { Tasks } from '@/shared/stores/tasksStore';
import {
  openFormWithCategoryAction,
  requestTaskFocusAction,
  selectTaskAction,
} from '@/shared/stores/uiStore';
import { arrowTargetId, isArrowKey, isControl, keyLetter } from '../lib';
import { TaskActionHandlers, TaskLocation } from '../types';

interface MatrixKeysOptions extends TaskActionHandlers {
  tasks: Tasks;
  /** The Selected Task; null without one */
  location: TaskLocation | null;
  /** List view has no selection yet (slice N): only the add keys work there */
  isMatrixView: boolean;
  toolbarRef: RefObject<HTMLElement | null>;
}

const selectAndFocus = (taskId: string) => {
  selectTaskAction(taskId);
  requestTaskFocusAction(taskId);
};

/**
 * The matrix keyboard, one handler for the page: arrows, 1–4, C/Space,
 * E/Enter, Del/Backspace, N and Esc. Keys in a text field or an open dialog
 * are left alone. Until slice G "add" opens the add form.
 */
export const useMatrixKeys = (options: MatrixKeysOptions) => {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, target } = event;
      if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;
      if (event.altKey || isTextField(target)) return;
      if (target instanceof HTMLSelectElement) return;
      // Both the current modal and a native <dialog> opened with showModal()
      if (document.querySelector('[aria-modal="true"], dialog[open]')) return;
      // Holding an action key down must not repeat the action
      if (event.repeat && !isArrowKey(key)) return;

      const {
        tasks,
        location,
        isMatrixView,
        toolbarRef,
        onComplete,
        onEdit,
        onMove,
        onDelete,
      } = optionsRef.current;
      const letter = keyLetter(event);
      const quadrant = MATRIX_KEYS.find(
        (quadrantKey) => QUADRANTS[quadrantKey].shortcut === key,
      );
      const handle = (action: () => void) => {
        event.preventDefault(); // Space scrolls, 1–4 search in Firefox
        action();
      };

      // List view keeps only 1–4, as before; its keys come with slice N
      if (!isMatrixView) {
        if (quadrant) handle(() => openFormWithCategoryAction(quadrant));
        return;
      }

      if (!location) {
        if (quadrant) handle(() => openFormWithCategoryAction(quadrant));
        else if (letter === 'n') {
          handle(() => openFormWithCategoryAction('ImportantUrgent'));
        } else if (key === 'ArrowDown') {
          // A task left focused by Esc is where the selection comes back
          const focusedTaskId =
            target instanceof HTMLElement &&
            target.getAttribute('role') === 'option'
              ? target.dataset.taskId
              : undefined;
          const taskId = focusedTaskId ?? firstTaskId(tasks);
          if (taskId) handle(() => selectAndFocus(taskId));
        }
        return;
      }

      const isInToolbar = toolbarRef.current?.contains(target as Node);

      if (quadrant) {
        handle(() => {
          if (quadrant !== location.quadrantKey) onMove(quadrant);
        });
      } else if (isArrowKey(key)) {
        handle(() => {
          const taskId = arrowTargetId(tasks, location, key);
          if (taskId) selectAndFocus(taskId);
        });
      } else if (letter === 'c' || (key === ' ' && !isControl(target))) {
        handle(onComplete);
      } else if (letter === 'e' || (key === 'Enter' && !isControl(target))) {
        handle(onEdit);
      } else if (key === 'Delete' || key === 'Backspace') {
        handle(onDelete);
      } else if (letter === 'n') {
        handle(() => openFormWithCategoryAction(location.quadrantKey));
      } else if (key === 'Escape') {
        // From the toolbar back to the task, from the task out of the selection
        handle(() =>
          isInToolbar
            ? requestTaskFocusAction(location.task.id)
            : selectTaskAction(null),
        );
      } else if (
        key === 'Tab' &&
        !event.shiftKey &&
        target instanceof Element &&
        target.closest('[role="option"]')
      ) {
        // The toolbar sits at the end of the page; Tab goes straight to it
        const firstButton =
          toolbarRef.current?.querySelector<HTMLElement>('button:enabled');
        if (firstButton) handle(() => firstButton.focus());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
