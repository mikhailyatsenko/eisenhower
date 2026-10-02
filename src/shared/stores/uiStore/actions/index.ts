import { Deadline, MatrixKey } from '@/shared/stores/tasksStore';
import { useUIStore } from '../hooks';
import type { ViewMode } from '../types';

const resetRecentlyAddedQuadrant = () => {
  useUIStore.setState((state) => {
    state.recentlyAddedQuadrant = null;
  });
};

export const setRecentlyAddedQuadrantAction = (quadrant: MatrixKey | null) => {
  useUIStore.setState((state) => {
    state.recentlyAddedQuadrant = quadrant;
  });
  setTimeout(resetRecentlyAddedQuadrant, 550);
};

const withoutSection = (sections: MatrixKey[], quadrant: MatrixKey) =>
  sections.filter((key) => key !== quadrant);

// Where Esc from the inline add field puts the focus back, set by each open.
// An element, so it stays out of the store's state: nothing renders from it.
let inlineAddReturnFocus: HTMLElement | null = null;

/**
 * What the keyboard or "Add a task" opened the open inline add field from,
 * maybe gone from the page since; null for a click on empty space or "+ Add"
 */
export const getInlineAddReturnFocus = () =>
  useUIStore.getState().inlineAdd ? inlineAddReturnFocus : null;

/**
 * Opens the inline add field in the quadrant, or moves it there with its
 * text and deadline: from "+ Add", a click on empty space, the keyboard or
 * "Add a task". The selection goes: no action panel while the field is open.
 * Esc puts the focus back on `returnFocus`, else on the quadrant's "+ Add". A
 * collapsed List view section expands for it, and stays expanded.
 */
export const openInlineAddAction = (
  quadrant: MatrixKey,
  returnFocus: HTMLElement | null = null,
) => {
  inlineAddReturnFocus = returnFocus;
  useUIStore.setState((state) => {
    state.selectedTaskId = null;
    state.inlineAdd = {
      quadrant,
      text: state.inlineAdd?.text ?? '',
      deadline: state.inlineAdd?.deadline ?? null,
      openCount: (state.inlineAdd?.openCount ?? 0) + 1,
    };
    if (state.viewMode === 'list') {
      state.collapsedSections = withoutSection(
        state.collapsedSections,
        quadrant,
      );
    }
  });
};

/** Records a task the inline add field added: its text and deadline go */
export const recordInlineTaskAddAction = () => {
  useUIStore.setState((state) => {
    if (!state.inlineAdd) return;
    state.inlineAdd.text = '';
    state.inlineAdd.deadline = null;
  });
};

export const setInlineAddTextAction = (text: string) => {
  useUIStore.setState((state) => {
    if (state.inlineAdd) state.inlineAdd.text = text;
  });
};

export const setInlineAddDeadlineAction = (deadline: Deadline | null) => {
  useUIStore.setState((state) => {
    if (state.inlineAdd) state.inlineAdd.deadline = deadline;
  });
};

export const closeInlineAddAction = () => {
  useUIStore.setState((state) => {
    state.inlineAdd = null;
  });
};

/** Opens the text edit of a task with its text as the draft */
export const startTextEditAction = (taskId: string, text: string) => {
  useUIStore.setState((state) => {
    state.textEdit = { taskId, draft: text };
  });
};

export const setTextEditDraftAction = (draft: string) => {
  useUIStore.setState((state) => {
    if (state.textEdit) state.textEdit.draft = draft;
  });
};

export const closeTextEditAction = () => {
  useUIStore.setState((state) => {
    state.textEdit = null;
  });
};

export const setViewModeAction = (viewMode: ViewMode) => {
  useUIStore.setState((state) => {
    state.viewMode = viewMode;
    // Another view starts without a selection and the inline add field
    state.selectedTaskId = null;
    state.inlineAdd = null;
  });
};

/**
 * Collapses or expands a List view section; remembered on the device. The
 * add field goes out of sight with its section, and closes.
 */
export const setSectionCollapsedAction = (
  quadrant: MatrixKey,
  isCollapsed: boolean,
) => {
  useUIStore.setState((state) => {
    const others = withoutSection(state.collapsedSections, quadrant);
    state.collapsedSections = isCollapsed ? [...others, quadrant] : others;
    if (isCollapsed && state.inlineAdd?.quadrant === quadrant) {
      state.inlineAdd = null;
    }
  });
};

/** Expands or collapses the Completed section; remembered on the device */
export const setCompletedExpandedAction = (isExpanded: boolean) => {
  useUIStore.setState((state) => {
    state.isCompletedExpanded = isExpanded;
  });
};

export const requestTaskFocusAction = (taskId: string | null) => {
  useUIStore.setState((state) => {
    state.taskToFocus = taskId;
  });
};

export const setDraggingTaskAction = (isDragging: boolean) => {
  useUIStore.setState((state) => {
    state.isDraggingTask = isDragging;
  });
};

export const selectTaskAction = (taskId: string | null) => {
  useUIStore.setState((state) => {
    state.selectedTaskId = taskId;
    if (taskId) {
      state.lastSelectedTaskId = taskId;
      state.addTaskTabStop = null;
    }
  });
};

/**
 * Makes an empty quadrant's "Add a task" the matrix's Tab stop, as it takes
 * the focus. No task is selected meanwhile.
 */
export const setAddTaskTabStopAction = (quadrant: MatrixKey) => {
  useUIStore.setState((state) => {
    state.selectedTaskId = null;
    state.addTaskTabStop = quadrant;
  });
};

export const requestAddTaskButtonFocusAction = (quadrant: MatrixKey | null) => {
  useUIStore.setState((state) => {
    state.addTaskButtonToFocus = quadrant;
  });
};

export const setFullScreenQuadrantAction = (quadrant: MatrixKey | null) => {
  useUIStore.setState((state) => {
    state.fullScreenQuadrant = quadrant;
  });
};
