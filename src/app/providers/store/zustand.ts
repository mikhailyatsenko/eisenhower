import { QuadrantPriorityKey } from '@/entities/quadrant/model/types/quadrantTypes';
import { create } from 'zustand';

// Type for Zustand store
interface TaskStore {
  tasks: Record<QuadrantPriorityKey, string[]>;
  addTask: (priority: QuadrantPriorityKey, task: string) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: {
    ImportantUrgent: [],
    ImportantNotUrgent: [],
    NotImportantUrgent: [],
    NotImportantNotUrgent: [],
  },
  addTask: (priority, task) => {
    console.log(priority, task);
    return set((state) => ({
      tasks: {
        ...state.tasks,
        [priority]: [...state.tasks[priority], task],
      },
    }));
  },
}));
