import { MATRIX_KEYS } from '@/shared/consts';
import { Tasks } from '@/shared/stores/tasksStore';

/** The first task of Do First, or of the first non-empty quadrant after it */
export const firstTaskId = (tasks: Tasks) => {
  const quadrantKey = MATRIX_KEYS.find((key) => tasks[key].length > 0);
  return quadrantKey ? tasks[quadrantKey][0].id : null;
};
