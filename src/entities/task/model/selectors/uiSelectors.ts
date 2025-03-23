import { UIState } from '../../../../shared/stores/uiStore/hooks';

export const getSelectedCategory = (state: UIState) => state.selectedCategory;

export const getTaskInputText = (state: UIState) => state.taskInputText;

export const getRecentlyAddedQuadrant = (state: UIState) =>
  state.recentlyAddedQuadrant;
