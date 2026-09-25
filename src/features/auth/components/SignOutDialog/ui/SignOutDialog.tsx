import { useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/shared/ui/modal';
import { pendingChangesMessage } from '../lib';

interface SignOutDialogProps {
  /** Pending changes by this session's count; null when they can't be counted */
  pendingChanges: number | null;
  onStay: () => void;
  onSignOut: () => void;
  /** Where the focus goes on close */
  restoreFocus: () => void;
}

const buttonClasses =
  'cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 dark:focus-visible:outline-indigo-300';

/**
 * Asks before signing out would lose Pending changes. Escape and a click on
 * the backdrop keep the user signed in.
 */
export const SignOutDialog: React.FC<SignOutDialogProps> = ({
  pendingChanges,
  onStay,
  onSignOut,
  restoreFocus,
}) => {
  const messageId = useId();

  return (
    <Modal
      label="Sign out?"
      describedBy={messageId}
      onClose={onStay}
      restoreFocus={restoreFocus}
      className="items-stretch gap-4 p-6"
    >
      <h2 className="text-lg font-semibold">Sign out?</h2>
      <p id={messageId} className="text-gray-700 dark:text-gray-300">
        {pendingChangesMessage(pendingChanges)}
      </p>
      {/* Stay comes first: showModal() focuses it, the safe answer */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onStay}
          className={twMerge(
            buttonClasses,
            'bg-indigo-700 text-white hover:bg-indigo-800 dark:bg-indigo-300 dark:text-gray-900 dark:hover:bg-indigo-200',
          )}
        >
          Stay signed in
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className={twMerge(
            buttonClasses,
            'text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950',
          )}
        >
          Sign out anyway
        </button>
      </div>
    </Modal>
  );
};
