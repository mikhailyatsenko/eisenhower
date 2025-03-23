export {
  getActiveState,
  getAllFirebaseTasks,
  getAllLocalTasks,
} from './model/selectors/tasksSelector';

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
} from '../../shared/stores/tasksStore/actions';

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
} from '../../shared/stores/uiStore/hooks';
