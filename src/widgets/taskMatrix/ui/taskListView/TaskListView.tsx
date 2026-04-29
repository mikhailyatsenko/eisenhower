'use client';

import { TaskItem } from '@/entities/matrixLayout/components/taskItem';
import {
  completeTaskAction,
  deleteTaskAction,
  editTaskAction,
  MatrixKey,
  Task,
} from '@/shared/stores/tasksStore';
import {
  setSortDirectionAction,
  setSortFieldAction,
  useUIStore,
} from '@/shared/stores/uiStore';

interface TaskListViewProps {
  tasks: Record<MatrixKey, Task[]>;
}

const quadrantWeights: Record<MatrixKey, number> = {
  ImportantUrgent: 4,
  ImportantNotUrgent: 3,
  NotImportantUrgent: 2,
  NotImportantNotUrgent: 1,
};

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks }) => {
  const { sortField, sortDirection } = useUIStore();

  const allTasksWithQuadrant = Object.entries(tasks).flatMap(
    ([quadrant, quadrantTasks]) =>
      quadrantTasks.map((task) => ({
        ...task,
        quadrantKey: quadrant as MatrixKey,
      })),
  );

  const sortedTasks = [...allTasksWithQuadrant].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'createdAt') {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === 'importance') {
      comparison =
        quadrantWeights[a.quadrantKey as MatrixKey] -
        quadrantWeights[b.quadrantKey as MatrixKey];
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-4 flex w-full max-w-2xl justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Sort by:</span>
          <select
            value={sortField}
            onChange={(e) =>
              setSortFieldAction(e.target.value as 'createdAt' | 'importance')
            }
            className="rounded border border-gray-300 bg-transparent p-1 dark:border-gray-600 dark:text-gray-300"
          >
            <option value="createdAt">Date</option>
            <option value="importance">Importance</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Order:</span>
          <select
            value={sortDirection}
            onChange={(e) =>
              setSortDirectionAction(e.target.value as 'asc' | 'desc')
            }
            className="rounded border border-gray-300 bg-transparent p-1 dark:border-gray-600 dark:text-gray-300"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <ul className="w-full max-w-2xl">
        {sortedTasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            quadrantKey={task.quadrantKey}
            index={index}
            editTaskAction={editTaskAction}
            deleteTaskAction={deleteTaskAction}
            completeTaskAction={completeTaskAction}
            disableDnd={true}
          />
        ))}
        {sortedTasks.length === 0 && (
          <div className="py-10 text-center text-gray-500">
            No active tasks found.
          </div>
        )}
      </ul>
    </div>
  );
};
