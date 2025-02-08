import { TaskPriorityKey } from '../types/quadrantTypes';

export enum TaskPriority {
  ImportantUrgent = 'Urgent & Important',
  ImportantNotUrgent = 'Important & Not Urgent',
  NotImportantUrgent = 'Urgent & Not Important',
  NotImportantNotUrgent = 'Not Urgent & Not Important',
}

// Colors for each quadrant
export const priorityColorClasses: Record<TaskPriorityKey, string> = {
  ImportantUrgent: 'bg-red-500',
  ImportantNotUrgent: 'bg-yellow-500',
  NotImportantUrgent: 'bg-blue-500',
  NotImportantNotUrgent: 'bg-green-500',
};
