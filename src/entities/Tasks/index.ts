export {
  getActiveState,
  getAllFirebaseTasks,
  getAllLocalTasks,
} from './model/selectors/tasksSelector';

export { MatrixQuadrants } from './model/consts/taskMatrixConsts';
export type { MatrixKey, Task } from './model/types/taskMatrixTypes';

export {
  useTaskStore,
  switchToLocalTasks,
  switchToFirebaseTasks,
  addTaskAction,
  deleteTaskAction,
  dragEndAction,
  dragOverQuadrantAction,
  editTaskAction,
  syncTasks,
} from './model/store/tasksStore';

export {
  getSelectedCategory,
  getRecentlyAddedQuadrant,
  getTaskInputText,
} from './model/selectors/uiSelectors';

export {
  setRecentlyAddedQuadrantAction,
  setSelectedCategoryAction,
  setTaskInputTextAction,
  useUIStore,
} from './model/store/uiStore';
