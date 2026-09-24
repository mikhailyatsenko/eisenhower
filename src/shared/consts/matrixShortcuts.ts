import type { Shortcut } from '@/shared/ui/shortcutsTable';
import { MATRIX_KEYS, QUADRANTS } from './quadrants';

const QUADRANT_TITLES = MATRIX_KEYS.map((key) => QUADRANTS[key].title);

/**
 * The matrix keyboard as the shortcuts cheatsheet and the method page tell
 * it. The keys themselves are handled in features/selectTask.
 */
export const MATRIX_SHORTCUTS: Shortcut[] = [
  {
    keys: ['↓', '↑'],
    action:
      'Next or previous task in the quadrant. With nothing selected, ↓ selects the first task.',
  },
  { keys: ['←', '→'], action: 'The same place in the next quadrant' },
  { keys: ['Tab'], action: 'From the task to its action panel; Esc goes back' },
  {
    keys: ['1–4'],
    action: `Move the task to ${QUADRANT_TITLES.slice(0, -1).join(', ')} or ${QUADRANT_TITLES.at(-1)}. With nothing selected, add a task there.`,
  },
  { keys: ['C', 'Space'], action: 'Complete the task' },
  { keys: ['E', 'Enter'], action: 'Edit the task' },
  { keys: ['Delete', 'Backspace'], action: 'Delete the task' },
  {
    keys: ['N'],
    action: `Add a task to the selected task’s quadrant, or to ${QUADRANT_TITLES[0]}`,
  },
  { keys: ['Esc'], action: 'Clear the selection' },
  { keys: ['Ctrl/Cmd+Z'], action: 'Undo the last action' },
  { keys: ['?'], action: 'Show these shortcuts' },
];

export const DRAG_HINT =
  'Drag a task to reorder or move it; long-press on touch';
