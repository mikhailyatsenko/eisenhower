import { useId } from 'react';
import { DialogButton, Modal } from '@/shared/ui/modal';

interface DeleteAllDialogProps {
  /** All completed tasks */
  count: number;
  isDeleting: boolean;
  /** Deleting has failed: the dialog stays open to try again */
  hasFailed: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Where the focus goes on close */
  restoreFocus: () => void;
}

/**
 * Asks before deleting all completed tasks, which can't be undone. Escape,
 * Cancel and a click on the backdrop keep them.
 */
export const DeleteAllDialog: React.FC<DeleteAllDialogProps> = ({
  count,
  isDeleting,
  hasFailed,
  onConfirm,
  onCancel,
  restoreFocus,
}) => {
  const messageId = useId();
  const title =
    count === 1
      ? 'Delete 1 completed task?'
      : `Delete all ${count} completed tasks?`;

  return (
    <Modal
      label={title}
      describedBy={messageId}
      onClose={onCancel}
      restoreFocus={restoreFocus}
      className="items-stretch gap-4 p-6"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p id={messageId} className="text-gray-700 dark:text-gray-300">
        This can&apos;t be undone.
      </p>
      {hasFailed && (
        <p
          role="alert"
          className="text-sm font-medium text-red-700 dark:text-red-300"
        >
          Couldn&apos;t delete. Try again
        </p>
      )}
      {/* Cancel comes first: showModal() focuses it, the safe answer */}
      <div className="flex flex-wrap justify-end gap-2">
        <DialogButton variant="secondary" onClick={onCancel}>
          Cancel
        </DialogButton>
        <DialogButton
          variant="danger"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          Delete all
        </DialogButton>
      </div>
    </Modal>
  );
};
