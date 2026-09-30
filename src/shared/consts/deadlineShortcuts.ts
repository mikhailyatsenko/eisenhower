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

// What the name of a chip leaves unsaid, for the cheatsheet
const CHIP_DETAIL: Partial<Record<DeadlineChip, string>> = {
  'This weekend': 'Saturday, or today at the weekend',
  'Next week': 'Monday',
};

/**
 * The keys of the deadline choices and the deadline strip, as the shortcuts
 * cheatsheet and the method page tell them. The keys themselves are handled
 * by the choices and the strip.
 */
export const DEADLINE_SHORTCUTS: Shortcut[] = [
  ...DEADLINE_CHIPS.map((chip) => ({
    keys: [DEADLINE_CHIP_KEYS[chip]],
    action: CHIP_DETAIL[chip] ? `${chip}: ${CHIP_DETAIL[chip]}` : chip,
  })),
  { keys: ['Delete', 'Backspace'], action: NO_DEADLINE },
  {
    keys: ['Enter'],
    action:
      'In the date or time field: set that date; while adding a task, add it',
  },
  {
    keys: ['Esc'],
    action:
      'Back to the action panel without changes, or from the deadline strip back to the add field',
  },
];
