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

export const setTaskInsertIndexAction = (index: number | null) => {
  useUIStore.setState((state) => {
    state.taskInsertIndex = index;
  });
};

export const setIsFormOpenedAction = (isOpened: boolean) => {
  useUIStore.setState((state) => {
    state.isFormOpened = isOpened;
    if (!isOpened) {
      state.taskInsertIndex = null;
    }
  });
};

export const openFormWithCategoryAction = (
  category: MatrixKey,
  index: number | null = null,
) => {
  useUIStore.setState((state) => {
    state.selectedCategory = category;
    state.isFormOpened = true;
    state.taskInsertIndex = index;
  });
};

export const setViewModeAction = (viewMode: 'matrix' | 'list') => {
  useUIStore.setState((state) => {
    state.viewMode = viewMode;
    // Selection lives in the matrix only, until List view gets it (slice N)
    state.selectedTaskId = null;
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
