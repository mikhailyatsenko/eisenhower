import { TaskPriority } from '../../model/consts/tasksMatrixConsts';
import { getAllTasks } from '../../model/selectors/tasksSelector';
import { useTaskStore } from '../../model/store/tasksStore';
import { TaskPriorityKey } from '../../model/types/quadrantTypes';
import { Quadrant } from '../quadrant/Quadrant';

export const TasksMatrix = () => {
  const tasks = useTaskStore(getAllTasks);
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(TaskPriority).map(([key, label]) => (
        <Quadrant
          key={key}
          title={label}
          priority={key as TaskPriorityKey}
          task={tasks[key as TaskPriorityKey]}
        />
      ))}
    </div>
  );
};
