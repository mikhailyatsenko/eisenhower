import { TaskState } from '../../../../shared/stores/tasksStore/actions';

export const getAllLocalTasks = (state: TaskState) => state.localTasks;
export const getAllFirebaseTasks = (state: TaskState) => state.firebaseTasks;
export const getActiveState = (state: TaskState) => state.activeState;
