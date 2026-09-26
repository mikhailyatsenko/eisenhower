import {
  addDays,
  addWeeks,
  isWeekend,
  nextSaturday,
  startOfDay,
  startOfWeek,
} from 'date-fns';

export const DEADLINE_CHIPS = [
  'Today',
  'Tomorrow',
  'This weekend',
  'Next week',
] as const;

export type DeadlineChip = (typeof DEADLINE_CHIPS)[number];

const chipDay: Record<DeadlineChip, (now: Date) => Date> = {
  Today: (now) => now,
  Tomorrow: (now) => addDays(now, 1),
  // On Saturday and Sunday the weekend is already here
  'This weekend': (now) => (isWeekend(now) ? now : nextSaturday(now)),
  'Next week': (now) => startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }),
};

/** The whole day a deadline chip sets, as its local midnight */
export const deadlineChipDate = (chip: DeadlineChip, now: Date) =>
  startOfDay(chipDay[chip](now));
