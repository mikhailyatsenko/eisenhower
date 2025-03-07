import { TaskState } from '../store/tasksStore';

export const getAllLocalTasks = (state: TaskState) => state.localTasks;
export const getAllFirebaseTasks = (state: TaskState) => state.firebaseTasks;
export const getActiveState = (state: TaskState) => state.activeState;
