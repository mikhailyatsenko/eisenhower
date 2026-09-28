import type { Shortcut } from '@/shared/ui/shortcutsTable';

/**
 * The deadline chips, in the order the deadline choices show them, and the
 * key that picks each one there. Their dates are in entities/matrixLayout.
 */
export const DEADLINE_CHIP_KEYS = {
  Today: 'T',
  Tomorrow: 'M',
  'This weekend': 'W',
  'Next week': 'X',
} as const;

export type DeadlineChip = keyof typeof DEADLINE_CHIP_KEYS;

export const DEADLINE_CHIPS = Object.keys(DEADLINE_CHIP_KEYS) as DeadlineChip[];

/** The chip that clears the deadline, picked by Delete or Backspace */
export const NO_DEADLINE = 'No deadline';

const CHIP_ACTION: Record<DeadlineChip, string> = {
  Today: 'Today',
  Tomorrow: 'Tomorrow',
  'This weekend': 'This weekend: Saturday, or today at the weekend',
  'Next week': 'Next week: Monday',
};

/**
 * The keys of the deadline choices, as the shortcuts cheatsheet and the
 * method page tell them. The keys themselves are handled by the choices.
 */
export const DEADLINE_SHORTCUTS: Shortcut[] = [
  ...DEADLINE_CHIPS.map((chip) => ({
    keys: [DEADLINE_CHIP_KEYS[chip]],
    action: CHIP_ACTION[chip],
  })),
  { keys: ['Delete', 'Backspace'], action: NO_DEADLINE },
  { keys: ['Enter'], action: 'In the date or time field: set that date' },
  { keys: ['Esc'], action: 'Back to the action panel without changes' },
];
