import { useNow } from '@/shared/hooks';
import { Task } from '@/shared/stores/tasksStore';
import { deadlineStatus } from '../lib';

/** The task's deadline status, kept up to date by the page's clock */
export const useDeadlineStatus = ({ dueDate, hasDueTime }: Task) =>
  deadlineStatus(dueDate, hasDueTime, useNow());
