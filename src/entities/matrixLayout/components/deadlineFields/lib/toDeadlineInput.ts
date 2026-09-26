import { format } from 'date-fns';
import { Task } from '@/shared/stores/tasksStore';
import { DeadlineInput } from '../types';
import { toDateValue } from './toDateValue';

/** The fields of a task's deadline; one set before R4 has a time */
export const toDeadlineInput = ({
  dueDate,
  hasDueTime,
}: Pick<Task, 'dueDate' | 'hasDueTime'>): DeadlineInput => ({
  date: dueDate ? toDateValue(dueDate) : '',
  time: dueDate && hasDueTime !== false ? format(dueDate, 'HH:mm') : null,
});
