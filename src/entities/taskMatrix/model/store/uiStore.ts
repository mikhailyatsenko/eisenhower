import { create } from 'zustand';
import { MatrixKey } from '../types/taskMatrixTypes';

export interface UIState {
  selectedCategory: MatrixKey;
  taskInputText: string;
  isLoading: boolean;
}

export const useUIStore = create<UIState>()(() => ({
  selectedCategory: 'ImportantUrgent',
  taskInputText: '',
  isLoading: true,
}));

export const setSelectedCategoryAction = (category: MatrixKey) => {
  useUIStore.setState({ selectedCategory: category });
};

export const settaskInputTextAction = (text: string) => {
  useUIStore.setState({ taskInputText: text });
};

export const setLoadingAction = (loading: boolean) => {
  useUIStore.setState({ isLoading: loading });
};
