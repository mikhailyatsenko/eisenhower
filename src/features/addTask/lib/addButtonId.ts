import { MatrixKey } from '@/shared/stores/tasksStore';

/** The quadrant's "+", where focus goes back when its field closes */
export const addButtonId = (quadrant: MatrixKey) => `add-task-to-${quadrant}`;
