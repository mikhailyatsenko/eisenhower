import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { UI_STORAGE_KEY } from '../consts';
import { UIState } from '../types';

const initialState: UIState = {
  recentlyAddedQuadrant: null,
  viewMode: 'matrix',
  collapsedSections: [],
  isCompletedExpanded: false,
  taskToFocus: null,
  selectedTaskId: null,
  lastSelectedTaskId: null,
  fullScreenQuadrant: null,
  inlineAdd: null,
  textEdit: null,
  isDraggingTask: false,
  addTaskTabStop: null,
  addTaskButtonToFocus: null,
};

export const useUIStore = create<UIState>()(
  persist(
    immer<UIState>(() => initialState),
    {
      name: UI_STORAGE_KEY,
      partialize: (state) => ({
        viewMode: state.viewMode,
        collapsedSections: state.collapsedSections,
        isCompletedExpanded: state.isCompletedExpanded,
      }),
    },
  ),
);
