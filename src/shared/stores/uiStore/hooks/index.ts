import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { DEFAULT_SELECTED_CATEGORY, UI_STORAGE_KEY } from '../consts';
import { UIState } from '../types';

const initialState: UIState = {
  selectedCategory: DEFAULT_SELECTED_CATEGORY,
  taskInputText: '',
  recentlyAddedQuadrant: null,
  isFormOpened: false,
  viewMode: 'matrix',
  collapsedSections: [],
  taskToFocus: null,
  selectedTaskId: null,
  lastSelectedTaskId: null,
  fullScreenQuadrant: null,
  inlineAdd: null,
  addTaskTabStop: null,
  addTaskButtonToFocus: null,
  hasAddedByEmptySpace: false,
};

export const useUIStore = create<UIState>()(
  persist(
    immer<UIState>(() => initialState),
    {
      name: UI_STORAGE_KEY,
      partialize: (state) => ({
        viewMode: state.viewMode,
        collapsedSections: state.collapsedSections,
        hasAddedByEmptySpace: state.hasAddedByEmptySpace,
      }),
    },
  ),
);
