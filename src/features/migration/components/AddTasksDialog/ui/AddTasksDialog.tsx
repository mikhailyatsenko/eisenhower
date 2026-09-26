import { useId } from 'react';
import { DialogButton, Modal } from '@/shared/ui/modal';
import { taskCount } from '../../../lib';

interface AddTasksDialogProps {
  /** Tasks the device would add, active and Completed */
  count: number;
  onAdd: () => void;
  /** "Don't add" and Escape; a stray click on the backdrop answers nothing */
  onDontAdd: () => void;
  /** Where the focus goes on close */
  restoreFocus: () => void;
}

/** Asks whether to add the device's tasks to an account with its own */
export const AddTasksDialog: React.FC<AddTasksDialogProps> = ({
  count,
  onAdd,
  onDontAdd,
  restoreFocus,
}) => {
  const messageId = useId();
  const title = `Add ${taskCount(count)} from this device to your account?`;

  return (
    <Modal
      label={title}
      describedBy={messageId}
      onClose={onDontAdd}
      restoreFocus={restoreFocus}
      closesOnBackdropClick={false}
      className="items-stretch gap-4 p-6"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p id={messageId} className="text-gray-700 dark:text-gray-300">
        Your account already has tasks. The tasks from this device will be added
        after them.
      </p>
      {/* Add comes first: showModal() focuses it */}
      <div className="flex flex-wrap justify-end gap-2">
        <DialogButton variant="primary" onClick={onAdd}>
          Add
        </DialogButton>
        <DialogButton variant="secondary" onClick={onDontAdd}>
          Don&apos;t add
        </DialogButton>
      </div>
    </Modal>
  );
};
