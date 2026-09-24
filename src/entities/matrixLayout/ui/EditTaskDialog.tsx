import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import { Modal } from '@/shared/ui/modal';
import { EditTaskForm } from '../components/editTaskForm';
import { colors } from '../consts';

interface EditTaskDialogProps {
  task: Task;
  /** Where the task sits now: active tasks don't store their quadrant */
  quadrantKey: MatrixKey;
  onSave: (
    editText: string,
    dueDate: Date | null,
    newQuadrant?: MatrixKey,
  ) => void;
  onClose: () => void;
  /** Where the focus goes on close; by default back to where it was */
  restoreFocus?: () => void;
}

/** The usual edit form in a dialog, tinted by the quadrant being picked */
export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  task,
  quadrantKey,
  onSave,
  onClose,
  restoreFocus,
}) => {
  const [currentQuadrant, setCurrentQuadrant] =
    useState<MatrixKey>(quadrantKey);

  return (
    <Modal
      label="Edit task"
      onClose={onClose}
      restoreFocus={restoreFocus}
      width="lg"
      className={twMerge(
        colors[currentQuadrant],
        'border-none p-6 shadow-2xl transition-colors duration-300',
      )}
    >
      <div className="flex h-fit max-h-[calc(100dvh-88px)] w-full flex-col overflow-hidden">
        <h3 className="mb-4 shrink-0 text-center text-lg font-bold tracking-widest text-gray-900 uppercase opacity-70 dark:text-gray-100">
          Edit Task
        </h3>
        <EditTaskForm
          handleSave={onSave}
          setIsEditing={(isEditing) => {
            if (!isEditing) onClose();
          }}
          task={{ ...task, quadrantKey }}
          onQuadrantChange={setCurrentQuadrant}
        />
      </div>
    </Modal>
  );
};
