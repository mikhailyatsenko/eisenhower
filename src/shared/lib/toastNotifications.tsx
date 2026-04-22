import { toast } from 'react-toastify';
import { QUADRANT_TITLES } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';

interface ToastContentProps {
  message: string;
  onUndo?: () => void | Promise<void>;
  closeToast?: () => void;
}

const ToastContent = ({ message, onUndo, closeToast }: ToastContentProps) => (
  <div className="flex w-full items-center justify-between">
    <span className="text-sm font-medium">{message}</span>
    {onUndo && (
      <button
        onClick={async (e) => {
          e.stopPropagation();
          await onUndo();
          closeToast?.();
        }}
        className="ml-4 cursor-pointer text-sm font-bold whitespace-nowrap text-[#ffa894] transition-colors hover:text-[#ffb3c6] active:scale-95 dark:text-[#ee7752] dark:hover:text-[#ea6f86]"
      >
        UNDO
      </button>
    )}
  </div>
);

const commonToastOptions = {
  position: 'bottom-center' as const,
  autoClose: 3500, // Increased a bit to give time to click Undo
  pauseOnFocusLoss: false,
  closeButton: false,
};

export const showToastNotificationByAddTask = (
  quadrant: MatrixKey,
  isRestored: boolean = false,
  onUndo?: () => void | Promise<void>,
) => {
  const message = `Task successfully ${isRestored ? 'restored' : `added to "${QUADRANT_TITLES[quadrant]}"`}`;
  toast(
    ({ closeToast }) => (
      <ToastContent message={message} onUndo={onUndo} closeToast={closeToast} />
    ),
    commonToastOptions,
  );
};

export const showToastNotificationByCompleteTask = (
  onUndo?: () => void | Promise<void>,
) => {
  toast(
    ({ closeToast }) => (
      <ToastContent
        message="Task marked as completed"
        onUndo={onUndo}
        closeToast={closeToast}
      />
    ),
    commonToastOptions,
  );
};

export const showToastNotificationByDeleteTask = (
  onUndo?: () => void | Promise<void>,
) => {
  toast(
    ({ closeToast }) => (
      <ToastContent
        message="Task successfully deleted"
        onUndo={onUndo}
        closeToast={closeToast}
      />
    ),
    commonToastOptions,
  );
};

export const showToastNotificationByEditTask = (
  onUndo?: () => void | Promise<void>,
) => {
  toast(
    ({ closeToast }) => (
      <ToastContent
        message="Task successfully updated"
        onUndo={onUndo}
        closeToast={closeToast}
      />
    ),
    commonToastOptions,
  );
};

export const showToastNotificationByCopyTasks = () => {
  toast(
    ({ closeToast }) => (
      <ToastContent
        message="All local tasks copied to cloud"
        closeToast={closeToast}
      />
    ),
    commonToastOptions,
  );
};
