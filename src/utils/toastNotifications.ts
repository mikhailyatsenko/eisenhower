import { toast } from 'react-toastify';
import { MatrixKey } from '@/entities/taskMatrix/@x/matrixKey';
import { MatrixQuadrants } from '@/entities/taskMatrix/model/consts/taskMatrixConsts';

export const showToastNotificationByAddTask = (quadrant: MatrixKey) => {
  toast.success(`Task successfully added to ${MatrixQuadrants[quadrant]}`, {
    position: 'bottom-left',
    autoClose: 1500,
    pauseOnFocusLoss: false,
    closeButton: false,
  });
};
