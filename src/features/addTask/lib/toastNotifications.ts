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
      position: 'bottom-left',
      autoClose: 2500,
      pauseOnFocusLoss: false,
      closeButton: false,
    },
  );
};
