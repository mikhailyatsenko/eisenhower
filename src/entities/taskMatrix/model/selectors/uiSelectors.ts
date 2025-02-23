import { UIState } from '../store/uiStore';

export const getSelectedCategory = (state: UIState) => state.selectedCategory;

export const getTaskText = (state: UIState) => state.taskText;

export const getIsLoading = (state: UIState) => state.isLoading;
