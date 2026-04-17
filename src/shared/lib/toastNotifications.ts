import { toast } from 'react-toastify';
import { QUADRANT_TITLES } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';

export const showToastNotificationByAddTask = (
  quadrant: MatrixKey,
  isRestored: boolean = false,
) => {
  toast(
    `Task successfully ${isRestored ? 'restored' : `added to "${QUADRANT_TITLES[quadrant]}"`} `,
    {
      position: 'bottom-center',
      autoClose: 2500,
      pauseOnFocusLoss: false,
      closeButton: false,
    },
  );
};

export const showToastNotificationByCompleteTask = () => {
  toast('Task marked as completed', {
    
    position: 'bottom-center',
    autoClose: 2500,
    pauseOnFocusLoss: false,
    closeButton: false,
  });
};

export const showToastNotificationByDeleteTask = () => {
  toast('Task successfully deleted', {
    position: 'bottom-center',
    autoClose: 2500,
    pauseOnFocusLoss: false,
    closeButton: false,
  });
};

export const showToastNotificationByEditTask = () => {
  toast('Task successfully updated', {
    position: 'bottom-center',
    autoClose: 2500,
    pauseOnFocusLoss: false,
    closeButton: false,
  });
};
