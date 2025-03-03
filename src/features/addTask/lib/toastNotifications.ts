import { toast } from 'react-toastify';
import { MatrixKey } from '@/entities/Matrix/@x/matrixKey';
import { MatrixQuadrants } from '@/entities/Matrix/model/consts/taskMatrixConsts';

export const showToastNotificationByAddTask = (quadrant: MatrixKey) => {
  toast.success(`Task successfully added to ${MatrixQuadrants[quadrant]}`, {
    position: 'bottom-left',
    autoClose: 2500,
    pauseOnFocusLoss: false,
    closeButton: false,
  });
};
