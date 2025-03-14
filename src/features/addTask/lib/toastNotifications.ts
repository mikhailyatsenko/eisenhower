import { toast } from 'react-toastify';
import { titleQuadrantMap } from '@/entities/quadrant/ui/quadrant/Quadrant';
import { MatrixKey } from '@/entities/Tasks/@x/matrixKey';

export const showToastNotificationByAddTask = (quadrant: MatrixKey) => {
  toast(`Task successfully added to "${titleQuadrantMap[quadrant]}"`, {
    position: 'bottom-left',
    autoClose: 2500,
    pauseOnFocusLoss: false,
    closeButton: false,
  });
};
