import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { STORAGE_KEY, LOCAL_STATE_KEY } from '../consts';
import { getEmptyTasksState } from '../lib';
import { TaskState } from '../types';

export const useTaskStore = create<TaskState>()(
  persist(
    immer<TaskState>(() => ({
      localTasks: getEmptyTasksState(),
      firebaseTasks: getEmptyTasksState(),
      activeState: LOCAL_STATE_KEY,
    })),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ localTasks: state.localTasks }),
    },
  ),
);
