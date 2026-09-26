import { useId } from 'react';
import { DialogButton, Modal } from '@/shared/ui/modal';
import { pendingChangesMessage } from '../lib';

interface SignOutDialogProps {
  /** Pending changes by this session's count; null when they can't be counted */
  pendingChanges: number | null;
  onStay: () => void;
  onSignOut: () => void;
  /** Where the focus goes on close */
  restoreFocus: () => void;
}

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
        <DialogButton variant="primary" onClick={onStay}>
          Stay signed in
        </DialogButton>
        <DialogButton variant="danger" onClick={onSignOut}>
          Sign out anyway
        </DialogButton>
      </div>
    </Modal>
  );
};
