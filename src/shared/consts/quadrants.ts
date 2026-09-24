/**
 * The one vocabulary for quadrants in the UI. Keys are what localStorage and
 * Firestore store, so they never change; only the strings below do.
 * Order is the matrix order: Do First, Schedule, Delegate, Eliminate.
 */
export const MATRIX_KEYS = [
  'ImportantUrgent',
  'ImportantNotUrgent',
  'NotImportantUrgent',
  'NotImportantNotUrgent',
] as const;

export type MatrixKey = (typeof MATRIX_KEYS)[number];

export interface QuadrantVocabulary {
  /** The action, shown wherever the quadrant is named */
  title: string;
  /** Importance first, then urgency; shown under the title in the forms */
  criteria: string;
  /** Keyboard shortcut that opens the add form in this quadrant */
  shortcut: '1' | '2' | '3' | '4';
  /** Typical tasks that belong here, starting with "e.g." */
  examples: string;
}

export const QUADRANTS: Record<MatrixKey, QuadrantVocabulary> = {
  ImportantUrgent: {
    title: 'Do First',
    criteria: 'Important & urgent',
    shortcut: '1',
    examples: 'e.g. Server is down, tax return due tomorrow',
  },
  ImportantNotUrgent: {
    title: 'Schedule',
    criteria: 'Important, not urgent',
    shortcut: '2',
    examples: 'e.g. Exercise, learn a new skill, plan next quarter',
  },
  NotImportantUrgent: {
    title: 'Delegate',
    criteria: 'Not important, urgent',
    shortcut: '3',
    examples: 'e.g. Book the flights, answer routine emails, most meetings',
  },
  NotImportantNotUrgent: {
    title: 'Eliminate',
    criteria: 'Not important, not urgent',
    shortcut: '4',
    examples: 'e.g. Endless scrolling, reorganizing files nobody opens',
  },
};
