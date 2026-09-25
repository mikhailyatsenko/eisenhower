import { MATRIX_KEYS } from '@/shared/consts';

/** Marks an empty quadrant's "Add a task" with the quadrant's key */
export const ADD_TASK_BUTTON_ATTRIBUTE = 'data-add-task-to';

/** The quadrant of the "Add a task" the element is; null for anything else */
export const addTaskButtonQuadrant = (element: EventTarget | null) => {
  if (!(element instanceof Element)) return null;
  const quadrant = element.getAttribute(ADD_TASK_BUTTON_ATTRIBUTE);
  return MATRIX_KEYS.find((key) => key === quadrant) ?? null;
};
