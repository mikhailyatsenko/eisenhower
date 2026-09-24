import type { Toast } from '../model';
import { formatShortcut } from './formatShortcut';

/** What a screen reader hears, e.g. "Task deleted. Undo with Ctrl+Z" */
export const toAnnouncement = ({ message, action }: Toast) =>
  action?.shortcutKey
    ? `${message}. ${action.label} with ${formatShortcut(action.shortcutKey)}`
    : message;
