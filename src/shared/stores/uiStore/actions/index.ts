import { MatrixKey } from '@/shared/stores/tasksStore';
import { useUIStore } from '../hooks';

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

export const openFormWithCategoryAction = (category: MatrixKey) => {
  useUIStore.setState((state) => {
    state.selectedCategory = category;
    state.isFormOpened = true;
  });
};

/**
 * Opens the inline add field in the quadrant, or moves it there with its
 * text. The selection goes: no action panel while the field is open.
 */
export const openInlineAddAction = (quadrant: MatrixKey) => {
  useUIStore.setState((state) => {
    state.selectedTaskId = null;
    state.inlineAdd = {
      quadrant,
      text: state.inlineAdd?.text ?? '',
      openCount: (state.inlineAdd?.openCount ?? 0) + 1,
    };
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

export const setViewModeAction = (viewMode: 'matrix' | 'list') => {
  useUIStore.setState((state) => {
    state.viewMode = viewMode;
    // Selection and the inline add field live in the matrix only, until List
    // view gets them (slice N)
    state.selectedTaskId = null;
    state.inlineAdd = null;
  });
};

export const setSortFieldAction = (field: 'createdAt' | 'importance') => {
  useUIStore.setState((state) => {
    state.sortField = field;
  });
};

export const setSortDirectionAction = (direction: 'asc' | 'desc') => {
  useUIStore.setState((state) => {
    state.sortDirection = direction;
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
    if (taskId) state.lastSelectedTaskId = taskId;
  });
};

export const setFullScreenQuadrantAction = (quadrant: MatrixKey | null) => {
  useUIStore.setState((state) => {
    state.fullScreenQuadrant = quadrant;
  });
};
