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

      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading;
        });
      },
    })),
    {
      name: 'task-store',
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    },
  ),
);

export const setSelectedCategoryAction = (category: MatrixKey) => {
  useTaskStore.setState({ selectedCategory: category });
};

export const setTaskTextAction = (text: string) => {
  useTaskStore.setState({ taskText: text });
};

export const addTaskAction = (quadrantKey: MatrixKey, taskText: string) => {
  useTaskStore.setState((state) => {
    if (taskText.length > 200) return;
    const newTask: Task = {
      id: uuidv4(),
      text: taskText,
      createdAt: new Date(),
    };
    state.tasks[quadrantKey].push(newTask);
  });
};

export const editTaskAction = (
  quadrantKey: MatrixKey,
  taskId: string,
  newText: string,
) => {
  useTaskStore.setState((state) => {
    const task = state.tasks[quadrantKey].find((t) => t.id === taskId);
    if (task) task.text = newText;
  });
};

export const dragOverQuadrantAction = (
  taskId: string,
  fromQuadrant: MatrixKey,
  toQuadrant: MatrixKey,
) => {
  useTaskStore.setState((state) => {
    const activeItems = state.tasks[fromQuadrant];
    const overItems = state.tasks[toQuadrant];

    const activeIndex = activeItems.findIndex(
      (item: Task) => item.id === taskId,
    );

    if (activeIndex !== -1) {
      const [movedTask] = activeItems.splice(activeIndex, 1);
      overItems.push(movedTask);
    }
  });
};

export const dragEndAction = (newTasks: Tasks) => {
  useTaskStore.setState((state) => {
    state.tasks = newTasks;
  });
};

export const deleteTaskAction = (quadrantKey: MatrixKey, taskId: string) => {
  useTaskStore.setState((state) => {
    state.tasks[quadrantKey] = state.tasks[quadrantKey].filter(
      (t: Task) => t.id !== taskId,
    );
  });
};
