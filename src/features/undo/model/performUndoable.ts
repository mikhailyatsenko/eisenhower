import { Revert } from '@/shared/stores/tasksStore';
import { requestTaskFocusAction } from '@/shared/stores/uiStore';
import { dismissToast, showToast } from '@/shared/ui/toast';

interface UndoableAction {
  /** Toast text, e.g. "Task deleted" */
  message: string;
  /** Does the action; resolves to its revert, or undefined if nothing happened */
  perform: () => Promise<Revert | undefined>;
  /** Task whose card gets focus after Undo */
  focusTaskId: string;
}

/**
 * Runs an action and offers Undo for it in the toast. There is one slot:
 * the next action's toast replaces this one, and this Undo is gone.
 */
export const performUndoable = async ({
  message,
  perform,
  focusTaskId,
}: UndoableAction) => {
  // A focus request whose card never showed up must not fire later
  requestTaskFocusAction(null);
  const revert = await perform();
  if (!revert) return;

  const toastId = showToast({
    message,
    action: {
      label: 'Undo',
      shortcutKey: 'z',
      onClick: async () => {
        // No toast for the Undo itself
        dismissToast(toastId);
        await revert();
        requestTaskFocusAction(focusTaskId);
      },
    },
  });
};
