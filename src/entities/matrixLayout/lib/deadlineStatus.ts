import { differenceInCalendarDays } from 'date-fns';

/** Due soon: tomorrow and the day after */
const SOON_DAYS = 2;

export type DeadlineStatus = 'overdue' | 'today' | 'soon';

/**
 * Where a deadline stands on the device's calendar. Without a time it is due
 * by the end of its day; a deadline without the flag (set before R4) has one.
 */
export const deadlineStatus = (
  dueDate: Date | undefined,
  hasDueTime: boolean | undefined,
  now: Date,
): DeadlineStatus | null => {
  if (!dueDate) return null;

  const days = differenceInCalendarDays(dueDate, now);
  const isPast = hasDueTime === false ? days < 0 : now > dueDate;

  if (isPast) return 'overdue';
  if (days === 0) return 'today';
  if (days <= SOON_DAYS) return 'soon';
  return null;
};
