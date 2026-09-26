import { TaskState } from '../types';

/** Completed of the Matrix, wherever its Storage is */
export const selectCompletedTasks = (state: TaskState) =>
  state.isInCloud ? state.firebaseCompletedTasks : state.localCompletedTasks;
