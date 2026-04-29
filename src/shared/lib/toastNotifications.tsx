import { toast } from 'react-toastify';
import { QUADRANT_TITLES } from '@/shared/consts';
import CloseIcon from '@/shared/icons/close-icon.svg';
import { MatrixKey } from '@/shared/stores/tasksStore';

interface ToastContentProps {
  message: string;
  onUndo?: () => void | Promise<void>;
  closeToast?: () => void;
}

const ToastContent = ({ message, onUndo, closeToast }: ToastContentProps) => (
  <div className="flex w-full items-center justify-between gap-2">
    <span className="text-sm font-medium">{message}</span>
    <div className="flex items-center gap-4">
      {onUndo && (
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await onUndo();
            closeToast?.();
          }}
          className="cursor-pointer text-sm font-bold whitespace-nowrap text-[#ffa894] transition-colors hover:text-[#ffb3c6] active:scale-95 dark:text-[#ee7752] dark:hover:text-[#ea6f86]"
        >
          UNDO
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeToast?.();
        }}
        className="flex cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70 active:scale-95"
        title="Close"
      >
        <CloseIcon className="h-4 w-4 stroke-white stroke-[6px] dark:stroke-gray-200" />
      </button>
    </div>
  </div>
);

const commonToastOptions = {
  position: 'bottom-center' as const,
  autoClose: 2500, // Increased a bit to give time to click Undo
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

export const showErrorToast = (message: string) => {
  toast.error(
    ({ closeToast }) => (
      <ToastContent message={message} closeToast={closeToast} />
    ),
    {
      ...commonToastOptions,
      autoClose: 5000,
    },
  );
};
