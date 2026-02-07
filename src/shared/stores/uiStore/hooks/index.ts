import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DEFAULT_SELECTED_CATEGORY } from '../consts';
import { UIState } from '../types';

const initialState: UIState = {
  selectedCategory: DEFAULT_SELECTED_CATEGORY,
  taskInputText: '',
  recentlyAddedQuadrant: null,
  isFormOpened: false,
};

export const useUIStore = create<UIState>()(immer(() => initialState));
