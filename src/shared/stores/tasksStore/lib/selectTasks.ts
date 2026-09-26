import { TaskState } from '../types';

/** The active tasks of the Matrix, wherever its Storage is */
export const selectTasks = (state: TaskState) =>
  state.isInCloud ? state.firebaseTasks : state.localTasks;
