import { MatrixKey } from '@/shared/stores/tasksStore';
import { useUIStore } from '../hooks';
import type { ViewMode } from '../types';

export const setSelectedCategoryAction = (category: MatrixKey) => {
  useUIStore.setState((state) => {
    state.selectedCategory = category;
  });
};

export const setTaskInputTextAction = (text: string) => {
  useUIStore.setState((state) => {
    state.taskInputText = text;
  });
};

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

export const setIsFormOpenedAction = (isOpened: boolean) => {
  useUIStore.setState((state) => {
    state.isFormOpened = isOpened;
  });
};

const withoutSection = (sections: MatrixKey[], quadrant: MatrixKey) =>
  sections.filter((key) => key !== quadrant);

// Where Esc from the inline add field puts the focus back, set by each open.
// An element, so it stays out of the store's state: nothing renders from it.
let inlineAddReturnFocus: HTMLElement | null = null;

/**
 * What the keyboard or "Add a task" opened the open inline add field from,
 * maybe gone from the page since; null for a click on empty space or "+"
 */
export const getInlineAddReturnFocus = () =>
  useUIStore.getState().inlineAdd ? inlineAddReturnFocus : null;

/**
 * Opens the inline add field in the quadrant, or moves it there with its
 * text. The selection goes: no action panel while the field is open. Esc
 * puts the focus back on `returnFocus`, else on the quadrant's "+". A
 * collapsed List view section expands for it, and stays expanded.
 */
const openInlineAdd = (
  quadrant: MatrixKey,
  returnFocus: HTMLElement | null,
  isByEmptySpace: boolean,
) => {
  inlineAddReturnFocus = returnFocus;
  useUIStore.setState((state) => {
    state.selectedTaskId = null;
    state.inlineAdd = {
      quadrant,
      text: state.inlineAdd?.text ?? '',
      openCount: (state.inlineAdd?.openCount ?? 0) + 1,
      isByEmptySpace,
    };
    if (state.viewMode === 'list') {
      state.collapsedSections = withoutSection(
        state.collapsedSections,
        quadrant,
      );
    }
  });
};

/** Opens the field from "+", the keyboard or "Add a task" */
export const openInlineAddAction = (
  quadrant: MatrixKey,
  returnFocus: HTMLElement | null = null,
) => openInlineAdd(quadrant, returnFocus, false);

/** Opens the inline add field as a click on the quadrant's empty space */
export const openInlineAddByEmptySpaceAction = (quadrant: MatrixKey) =>
  openInlineAdd(quadrant, null, true);

/**
 * Records a task the inline add field added: its text goes. The first one
 * added by a click on empty space retires the header hint.
 */
export const recordInlineTaskAddAction = () => {
  useUIStore.setState((state) => {
    if (!state.inlineAdd) return;
    state.inlineAdd.text = '';
    if (state.inlineAdd.isByEmptySpace) state.hasAddedByEmptySpace = true;
  });
};

export const setInlineAddTextAction = (text: string) => {
  useUIStore.setState((state) => {
    if (state.inlineAdd) state.inlineAdd.text = text;
  });
};

export const closeInlineAddAction = () => {
  useUIStore.setState((state) => {
    state.inlineAdd = null;
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

export const requestTaskFocusAction = (taskId: string | null) => {
  useUIStore.setState((state) => {
    state.taskToFocus = taskId;
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
