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
import { keyLetter } from '@/shared/lib/keyLetter';
import { Task, Tasks } from '@/shared/stores/tasksStore';
import {
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
  listArrowTarget,
  locateTask,
  taskCard,
} from '../lib';
import {
  ArrowKey,
  CompletedLocation,
  TaskActionHandlers,
  TaskLocation,
} from '../types';

interface MatrixKeysOptions extends TaskActionHandlers {
  tasks: Tasks;
  /** What Completed shows: none in the matrix or while it's collapsed */
  shownCompleted: Task[];
  /** The Selected Task; null without one or when it's completed */
  location: TaskLocation | null;
  /** The Selected Task when it's completed */
  completedLocation: CompletedLocation | null;
  onDeleteCompleted: () => void;
  /** List view walks its open sections, the matrix its 2×2 */
  isMatrixView: boolean;
  toolbarRef: RefObject<HTMLElement | null>;
  /** The panel shows the deadline choices: they take their own keys, the matrix none */
  isChoosingDeadline: boolean;
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
  shownCompleted: Task[],
  isMatrixView: boolean,
  from: MatrixStop,
  key: ArrowKey,
) => {
  if (!isMatrixView) {
    const { collapsedSections } = useUIStore.getState();
    return listArrowTarget(
      listSections(tasks, collapsedSections, shownCompleted),
      from,
      key,
    );
  }
  const at =
    'taskId' in from
      ? locateTask(tasks, from.taskId)
      : { quadrantKey: from.emptyQuadrant, index: 0 };
  return at && arrowTarget(tasks, at, key);
};

/** The task ArrowDown selects with nothing selected: the first one on screen */
const firstShownTaskId = (
  tasks: Tasks,
  shownCompleted: Task[],
  isMatrixView: boolean,
) => {
  if (isMatrixView) return firstTaskId(tasks);
  const { collapsedSections } = useUIStore.getState();
  const stop = listStops(tasks, collapsedSections, shownCompleted).find(
    (listStop) => 'taskId' in listStop,
  );
  return stop?.taskId ?? null;
};

/**
 * The matrix keyboard, one handler for the page and both views: arrows, 1–4,
 * C/Space, E/Enter, D, Del/Backspace, N, Esc and ? for the cheatsheet. Keys in
 * a text field or an open dialog are left alone, arrows on a List view
 * section's header too. "Add" opens the inline field in both views, and Esc
 * from it comes back to where the key was pressed. A completed task takes
 * only the arrows, Delete/Backspace and Esc.
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
      if (optionsRef.current.isChoosingDeadline) return;
      // Holding an action key down must not repeat the action
      if (event.repeat && !isArrowKey(key)) return;
      // The header's button collapses its section, it doesn't select
      if (isArrowKey(key) && isSectionToggle(target)) return;

      const {
        tasks,
        shownCompleted,
        location,
        completedLocation,
        onDeleteCompleted,
        isMatrixView,
        toolbarRef,
        onComplete,
        onEdit,
        onDeadline,
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

      const goToArrow = (from: MatrixStop, arrow: ArrowKey) => {
        const to = arrowStop(tasks, shownCompleted, isMatrixView, from, arrow);
        if (to) goTo(to);
      };

      // Shift with the ?/ key, whatever it types on the layout
      if (key === '?' || (event.code === 'Slash' && event.shiftKey)) {
        handle(onShowShortcuts);
        return;
      }

      const isInToolbar = toolbarRef.current?.contains(target as Node);
      const tabToToolbar = () => {
        // The toolbar sits at the end of the page; Tab goes straight to it
        const firstButton =
          toolbarRef.current?.querySelector<HTMLElement>('button:enabled');
        if (firstButton) handle(() => firstButton.focus());
      };
      const isTabFromTask =
        key === 'Tab' &&
        !event.shiftKey &&
        target instanceof Element &&
        target.closest('[role="option"]') !== null;

      // A completed task, selected or left focused by Esc, has no Move and no add
      const focusedCompletedId =
        target instanceof HTMLElement &&
        target.getAttribute('role') === 'option'
          ? shownCompleted.find(({ id }) => id === target.dataset.taskId)?.id
          : undefined;
      if (!completedLocation && focusedCompletedId) {
        if (quadrant || letter === 'n') return;
        if (key === ' ') event.preventDefault(); // No Complete, and no scroll
      }

      if (completedLocation) {
        const taskId = completedLocation.task.id;
        if (isArrowKey(key)) {
          handle(() => goToArrow({ taskId }, key));
        } else if (key === 'Delete' || key === 'Backspace') {
          handle(onDeleteCompleted);
        } else if (key === 'Escape') {
          handle(() =>
            isInToolbar
              ? requestTaskFocusAction(taskId)
              : selectTaskAction(null),
          );
        } else if (isTabFromTask) {
          tabToToolbar();
        } else if (key === ' ' && !isControl(target)) {
          event.preventDefault(); // No Complete, and no scroll
        }
        // Move, add, Complete and Edit aren't for a completed task
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
          handle(() => openInlineAddAction(quadrant, returnFocus));
        } else if (letter === 'n') {
          const { lastSelectedTaskId } = useUIStore.getState();
          const addTo =
            buttonQuadrant ??
            locateTask(tasks, lastSelectedTaskId)?.quadrantKey ??
            MATRIX_KEYS[0];
          handle(() => openInlineAddAction(addTo, returnFocus));
        } else if (buttonQuadrant && isArrowKey(key)) {
          handle(() => goToArrow({ emptyQuadrant: buttonQuadrant }, key));
        } else if (key === 'ArrowDown') {
          // A task left focused by Esc is where the selection comes back
          const focusedTaskId =
            target instanceof HTMLElement &&
            target.getAttribute('role') === 'option'
              ? target.dataset.taskId
              : undefined;
          const taskId =
            focusedTaskId ??
            firstShownTaskId(tasks, shownCompleted, isMatrixView);
          if (taskId) handle(() => selectAndFocus(taskId));
        }
        return;
      }

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
      } else if (letter === 'd') {
        handle(onDeadline);
      } else if (key === 'Delete' || key === 'Backspace') {
        handle(onDelete);
      } else if (letter === 'n') {
        // Esc from the field comes back to the task, from the toolbar too
        handle(() =>
          openInlineAddAction(location.quadrantKey, taskCard(location.task.id)),
        );
      } else if (key === 'Escape') {
        // From the toolbar back to the task, from the task out of the selection
        handle(() =>
          isInToolbar
            ? requestTaskFocusAction(location.task.id)
            : selectTaskAction(null),
        );
      } else if (isTabFromTask) {
        tabToToolbar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
