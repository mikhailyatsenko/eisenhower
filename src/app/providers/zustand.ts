import { QuadrantPriority } from '@/entities/categoryBlock/ui/CategoryBlock';
import { create } from 'zustand';

// Type for Zustand store
interface TaskStore {
  tasks: Record<QuadrantPriority, string[]>;
  addTask: (category: QuadrantPriority, task: string) => void;
}

// Zustand store
export const useTaskStore = create<TaskStore>((set) => ({
  tasks: Object.values(QuadrantPriority).reduce(
    (acc, key) => ({ ...acc, [key]: [] }),
    {} as Record<QuadrantPriority, string[]>,
  ),
  addTask: (category, task) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [category]: [...state.tasks[category], task],
      },
    })),
}));
