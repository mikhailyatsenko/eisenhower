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
  {
    keys: ['←', '→'],
    action:
      'The same place in the next quadrant, or the button that adds a task there when it’s empty',
  },
  { keys: ['Tab'], action: 'From the task to its action panel; Esc goes back' },
  {
    keys: ['1–4'],
    action: `Move the task to ${QUADRANT_TITLES.slice(0, -1).join(', ')} or ${QUADRANT_TITLES.at(-1)}. With nothing selected, open the add field there.`,
  },
  { keys: ['C', 'Space'], action: 'Complete the task' },
  {
    keys: ['E', 'Enter'],
    action:
      'Edit the task’s text right in the action panel: Enter saves, Esc cancels',
  },
  {
    keys: ['D'],
    action:
      'Set the deadline: the action panel turns into deadline choices, keys below',
  },
  { keys: ['Delete', 'Backspace'], action: 'Delete the task' },
  {
    keys: ['N'],
    action: `Open the add field in the quadrant of the selected or last selected task, or in ${QUADRANT_TITLES[0]}`,
  },
  {
    keys: ['Esc'],
    action: 'Clear the selection, as the × in the action panel does',
  },
  { keys: ['Ctrl/Cmd+Z'], action: 'Undo the last action' },
  { keys: ['?'], action: 'Show these shortcuts' },
];

/** Adding a task, for the cheatsheet and the method page */
export const ADD_HINT =
  'To add a task, press + Add in a quadrant’s title or click empty space in the quadrant, or press N or 1–4: a field opens at the end of the quadrant. While you type, the strip at the bottom sets a deadline for the new task; Tab takes you there from the field. Enter or Add adds the task and keeps the field open for the next one, Esc closes it.';

export const DRAG_HINT =
  'Drag a task to reorder or move it; long-press on touch';
