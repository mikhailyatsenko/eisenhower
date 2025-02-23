import { TaskState } from '../store/tasksStore';

export const getAllTasks = (state: TaskState) => state.tasks;
