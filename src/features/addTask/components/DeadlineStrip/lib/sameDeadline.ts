import { Deadline } from '@/shared/stores/tasksStore';

/** The same deadline: the same moment, a whole day or not alike */
export const sameDeadline = (
  a: Deadline | null,
  b: Deadline | null | undefined,
) =>
  a === b ||
  (!!a &&
    !!b &&
    a.dueDate.getTime() === b.dueDate.getTime() &&
    a.hasDueTime === b.hasDueTime);
