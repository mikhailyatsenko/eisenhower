import { create } from 'zustand';
import { MatrixKey } from '../types/taskMatrixTypes';

export interface UIState {
  selectedCategory: MatrixKey;
  taskText: string;
  isLoading: boolean;
}

export const useUIStore = create<UIState>()(() => ({
  selectedCategory: 'ImportantUrgent',
  taskText: '',
  isLoading: true,
}));

export const setSelectedCategoryAction = (category: MatrixKey) => {
  useUIStore.setState({ selectedCategory: category });
};

export const setTaskTextAction = (text: string) => {
  useUIStore.setState({ taskText: text });
};

export const setLoadingAction = (loading: boolean) => {
  useUIStore.setState({ isLoading: loading });
};
