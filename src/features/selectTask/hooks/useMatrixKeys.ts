import { RefObject, useEffect, useRef } from 'react';
import {
  MatrixStop,
  addTaskButtonQuadrant,
  firstTaskId,
  isSectionToggle,
  listSections,
  listStops,
} from '@/entities/matrixLayout';
import { MATRIX_KEYS, QUADRANTS } from '@/shared/consts';
import { isDialogOpen } from '@/shared/lib/isDialogOpen';
import { isTextField } from '@/shared/lib/isTextField';
import { MatrixKey, Tasks } from '@/shared/stores/tasksStore';
import {
  openFormWithCategoryAction,
  openInlineAddAction,
  requestAddTaskButtonFocusAction,
  requestTaskFocusAction,
  selectTaskAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import {
  arrowTarget,
  isArrowKey,
  isControl,
  keyLetter,
  listArrowTarget,
  locateTask,
  taskCard,
} from '../lib';
import { ArrowKey, TaskActionHandlers, TaskLocation } from '../types';

interface MatrixKeysOptions extends TaskActionHandlers {
  tasks: Tasks;
  /** The Selected Task; null without one */
  location: TaskLocation | null;
  /** List view walks its sections; adding there opens the task form for now */
  isMatrixView: boolean;
  toolbarRef: RefObject<HTMLElement | null>;
  onShowShortcuts: () => void;
}

const selectAndFocus = (taskId: string) => {
  selectTaskAction(taskId);
  requestTaskFocusAction(taskId);
};

/** A task gets selected and focused; "Add a task" gets focused, with no selection */
const goTo = (target: MatrixStop) => {
  if ('taskId' in target) {
    selectAndFocus(target.taskId);
  } else {
    selectTaskAction(null);
    requestAddTaskButtonFocusAction(target.emptyQuadrant);
  }
};

/**
 * Where an arrow goes: across the 2×2 in the matrix, through the open
 * sections in List view
 */
const arrowStop = (
  tasks: Tasks,
  isMatrixView: boolean,
  from: MatrixStop,
  key: ArrowKey,
) => {
  if (!isMatrixView) {
    const { collapsedSections } = useUIStore.getState();
    return listArrowTarget(listSections(tasks, collapsedSections), from, key);
  }
  const at =
    'taskId' in from
      ? locateTask(tasks, from.taskId)
      : { quadrantKey: from.emptyQuadrant, index: 0 };
  return at && arrowTarget(tasks, at, key);
};

/** The task ArrowDown selects with nothing selected: the first one on screen */
const firstShownTaskId = (tasks: Tasks, isMatrixView: boolean) => {
  if (isMatrixView) return firstTaskId(tasks);
  const { collapsedSections } = useUIStore.getState();
  const stop = listStops(tasks, collapsedSections).find(
    (listStop) => 'taskId' in listStop,
  );
  return stop?.taskId ?? null;
};

/**
 * The matrix keyboard, one handler for the page and both views: arrows, 1–4,
 * C/Space, E/Enter, Del/Backspace, N, Esc and ? for the cheatsheet. Keys in
 * a text field or an open dialog are left alone, arrows on a List view
 * section's header too. In the matrix "add" opens the inline field, and Esc
 * from it comes back to where the key was pressed; in List view it opens
 * the task form.
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
      if (isDialogOpen()) return;
      // Holding an action key down must not repeat the action
      if (event.repeat && !isArrowKey(key)) return;
      // The header's button collapses its section, it doesn't select
      if (isArrowKey(key) && isSectionToggle(target)) return;

      const {
        tasks,
        location,
        isMatrixView,
        toolbarRef,
        onComplete,
        onEdit,
        onMove,
        onDelete,
        onShowShortcuts,
      } = optionsRef.current;
      const letter = keyLetter(event);
      const quadrant = MATRIX_KEYS.find(
        (quadrantKey) => QUADRANTS[quadrantKey].shortcut === key,
      );
      const handle = (action: () => void) => {
        event.preventDefault(); // Space scrolls, 1–4 search in Firefox
        action();
      };

      const openAdd = (addTo: MatrixKey, returnFocus: HTMLElement | null) =>
        isMatrixView
          ? openInlineAddAction(addTo, returnFocus)
          : openFormWithCategoryAction(addTo);
      const goToArrow = (from: MatrixStop, arrow: ArrowKey) => {
        const to = arrowStop(tasks, isMatrixView, from, arrow);
        if (to) goTo(to);
      };

      // Shift with the ?/ key, whatever it types on the layout
      if (key === '?' || (event.code === 'Slash' && event.shiftKey)) {
        handle(onShowShortcuts);
        return;
      }

      if (!location) {
        // Focus leaves for the field and comes back here on Esc
        const returnFocus =
          target instanceof HTMLElement && target !== document.body
            ? target
            : null;
        // An empty quadrant's "Add a task" stands for its quadrant
        const buttonQuadrant = addTaskButtonQuadrant(target);

        if (quadrant) {
          handle(() => openAdd(quadrant, returnFocus));
        } else if (letter === 'n') {
          const { lastSelectedTaskId } = useUIStore.getState();
          const addTo =
            buttonQuadrant ??
            locateTask(tasks, lastSelectedTaskId)?.quadrantKey ??
            MATRIX_KEYS[0];
          handle(() => openAdd(addTo, returnFocus));
        } else if (buttonQuadrant && isArrowKey(key)) {
          handle(() => goToArrow({ emptyQuadrant: buttonQuadrant }, key));
        } else if (key === 'ArrowDown') {
          // A task left focused by Esc is where the selection comes back
          const focusedTaskId =
            target instanceof HTMLElement &&
            target.getAttribute('role') === 'option'
              ? target.dataset.taskId
              : undefined;
          const taskId = focusedTaskId ?? firstShownTaskId(tasks, isMatrixView);
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
        handle(() => goToArrow({ taskId: location.task.id }, key));
      } else if (letter === 'c' || (key === ' ' && !isControl(target))) {
        handle(onComplete);
      } else if (letter === 'e' || (key === 'Enter' && !isControl(target))) {
        handle(onEdit);
      } else if (key === 'Delete' || key === 'Backspace') {
        handle(onDelete);
      } else if (letter === 'n') {
        // Esc from the field comes back to the task, from the toolbar too
        handle(() => openAdd(location.quadrantKey, taskCard(location.task.id)));
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
