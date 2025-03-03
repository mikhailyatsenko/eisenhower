import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { MatrixKey } from '../types/taskMatrixTypes';

export interface UIState {
  selectedCategory: MatrixKey;
  taskInputText: string;
  isLoading: boolean;
  recentlyAddedQuadrant: MatrixKey | null;
}

const initialState: UIState = {
  selectedCategory: 'ImportantUrgent',
  taskInputText: '',
  isLoading: true,
  recentlyAddedQuadrant: null,
};

export const useUIStore = create<UIState>()(immer(() => initialState));

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

export const setLoadingAction = (loading: boolean) => {
  useUIStore.setState((state) => {
    state.isLoading = loading;
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
