import { UIState } from '../store/uiStore';

export const getSelectedCategory = (state: UIState) => state.selectedCategory;

export const getTaskInputText = (state: UIState) => state.taskInputText;

export const getIsLoading = (state: UIState) => state.isLoading;

export const getRecentlyAddedQuadrant = (state: UIState) =>
  state.recentlyAddedQuadrant;
