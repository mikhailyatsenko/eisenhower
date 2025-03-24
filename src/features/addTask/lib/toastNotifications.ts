import { toast } from 'react-toastify';
import { titleQuadrantMap } from '@/entities/matrixLayout/components/quadrant/ui/quadrant/Quadrant';
import { MatrixKey } from '@/shared/stores/tasksStore';

export const showToastNotificationByAddTask = (quadrant: MatrixKey) => {
  toast(`Task successfully added to "${titleQuadrantMap[quadrant]}"`, {
    position: 'bottom-left',
    autoClose: 2500,
    pauseOnFocusLoss: false,
    closeButton: false,
  });
};
