import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { MatrixKey, Task } from '../types/quadrantTypes';
import { Tasks, TaskState } from '../types/taskState';

const initialState: Tasks = {
  ImportantUrgent: [],
  ImportantNotUrgent: [],
  NotImportantUrgent: [],
  NotImportantNotUrgent: [],
};

export const useTaskStore = create<TaskState>()(
  persist(
    immer((set) => ({
      tasks: initialState,
      selectedCategory: 'ImportantUrgent',
      taskText: '',
      isLoading: true,

      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setTaskText: (text) => set({ taskText: text }),

      addTask: (quadrantKey, taskText) =>
        set((state) => {
          if (taskText.length > 200) return;
          const newTask: Task = {
            id: uuidv4(),
            text: taskText,
            createdAt: new Date(),
          };
          state.tasks[quadrantKey].push(newTask);
        }),

      editTask: (quadrantKey, taskId, newText) =>
        set((state) => {
          const task = state.tasks[quadrantKey].find((t) => t.id === taskId);
          if (task) task.text = newText;
        }),

      dragOverQuadrant: (taskId, fromQuadrant, toQuadrant) =>
        set((state) => {
          const activeItems = state.tasks[fromQuadrant];
          const overItems = state.tasks[toQuadrant];

          const activeIndex = activeItems.findIndex(
            (item: Task) => item.id === taskId,
          );

          if (activeIndex !== -1) {
            const [movedTask] = activeItems.splice(activeIndex, 1);
            overItems.push(movedTask);
          }
        }),

      dragEnd: (newTasks: Tasks) =>
        set((state) => {
          state.tasks = newTasks;
        }),

      deleteTask: (quadrantKey, taskId) =>
        set((state) => {
          state.tasks[quadrantKey] = state.tasks[quadrantKey].filter(
            (t: Task) => t.id !== taskId,
          );
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    })),
    {
      name: 'task-store',
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    },
  ),
);

export const addTaskAction = (quadrantKey: MatrixKey, taskText: string) => {
  useTaskStore.getState().addTask(quadrantKey, taskText);
};

export const editTaskAction = (
  quadrantKey: MatrixKey,
  taskId: string,
  newText: string,
) => {
  useTaskStore.getState().editTask(quadrantKey, taskId, newText);
};

export const dragEndAction = (newTasks: Tasks) => {
  useTaskStore.getState().dragEnd(newTasks);
};

export const dragOverQuadrantAction = (
  taskId: string,
  fromQuadrant: MatrixKey,
  toQuadrant: MatrixKey,
) => {
  useTaskStore.getState().dragOverQuadrant(taskId, fromQuadrant, toQuadrant);
};

export const deleteTaskAction = (quadrantKey: MatrixKey, taskId: string) => {
  useTaskStore.getState().deleteTask(quadrantKey, taskId);
};
