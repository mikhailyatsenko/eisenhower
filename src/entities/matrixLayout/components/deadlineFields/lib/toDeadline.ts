import { isValid } from 'date-fns';
import { Deadline } from '@/shared/stores/tasksStore';
import { DeadlineInput } from '../types';

/**
 * The deadline the fields set, in local time: null without a date, a whole
 * day without a time, undefined when the date can't be read
 */
export const toDeadline = ({
  date,
  time,
}: DeadlineInput): Deadline | null | undefined => {
  if (!date) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
  const dueDate = new Date(year, month - 1, day, hours, minutes);
  if (!isValid(dueDate)) return undefined;
  return { dueDate, hasDueTime: !!time };
};
