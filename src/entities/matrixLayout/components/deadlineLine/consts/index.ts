import { DeadlineStatus } from '../../../lib';

export const STATUS_LABEL: Record<DeadlineStatus, string> = {
  overdue: 'OVERDUE',
  today: 'DUE TODAY',
  soon: 'DUE SOON',
};

// Text over 4.5:1 on the badge; the muted fill sits on every quadrant colour
export const STATUS_BADGE_CLASS: Record<DeadlineStatus, string> = {
  overdue: 'bg-red-800 text-white',
  today: 'bg-black/10 text-gray-900 dark:bg-white/15 dark:text-gray-100',
  soon: 'bg-black/10 text-gray-900 dark:bg-white/15 dark:text-gray-100',
};

/** The overdue card's thick left stripe, over 3:1 to the card */
export const OVERDUE_STRIPE_CLASS =
  'border-l-4 border-red-800 dark:border-red-400';
