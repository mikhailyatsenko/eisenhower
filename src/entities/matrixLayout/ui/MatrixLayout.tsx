import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MatrixKey, MatrixQuadrants, Task } from '@/shared/stores/tasksStore';
import { editTaskAction, deleteTaskAction } from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { Quadrant, TaskItem } from '../components';

interface MatrixLayoutProps {
  tasks: Record<MatrixKey, Task[]>;
  quadrantOrder: MatrixKey[];
  dragOverQuadrant: MatrixKey | null;
  expandedQuadrant: MatrixKey | null;
  isAnimateByExpandQuadrant: boolean;
  handleToggleExpand: (quadrant: MatrixKey) => void;
  taskInputText: string;
}

export const MatrixLayout: React.FC<MatrixLayoutProps> = ({
  tasks,
  quadrantOrder,
  dragOverQuadrant,
  expandedQuadrant,
  isAnimateByExpandQuadrant,
  handleToggleExpand,
  taskInputText,
}) => {
  const { recentlyAddedQuadrant } = useUIStore();

  return (
    <>
      {Object.entries(MatrixQuadrants).map(([key]) => {
        const quadrantKey = key as MatrixKey;

        return (
          <Quadrant
            isAnimateByExpandQuadrant={isAnimateByExpandQuadrant}
            handleToggleExpand={handleToggleExpand}
            expandedQuadrant={expandedQuadrant}
            key={key}
            quadrantKey={quadrantKey}
            isDragOver={dragOverQuadrant === key}
            orderIndex={quadrantOrder.indexOf(quadrantKey)}
            isTypingNewTask={taskInputText.trim() !== ''}
            recentlyAddedQuadrant={recentlyAddedQuadrant}
            isNoTasks={tasks[quadrantKey].length === 0}
          >
            <SortableContext
              items={tasks[quadrantKey]}
              strategy={verticalListSortingStrategy}
            >
              <ul
                className={`scrollbar-hidden relative z-2 list-none flex-col ${expandedQuadrant === key ? 'flex pb-8' : 'hidden'} h-full overflow-x-hidden overflow-y-auto sm:flex`}
              >
                {tasks[quadrantKey].map((task, index) => (
                  <TaskItem
                    deleteTaskAction={deleteTaskAction}
                    editTaskAction={editTaskAction}
                    key={task.id}
                    task={task}
                    quadrantKey={quadrantKey}
                    index={index}
                  />
                ))}
              </ul>

              <p
                className={`text-foreground absolute top-0 left-1 z-0 text-7xl opacity-15 select-none sm:top-1 sm:left-6 sm:text-sm sm:opacity-50 ${tasks[quadrantKey].length === 0 ? 'sm:!text-7xl sm:!opacity-25' : ''}`}
              >
                {expandedQuadrant !== key &&
                  `${tasks[quadrantKey].length} task${tasks[quadrantKey].length !== 1 ? 's' : ''}`}
              </p>
            </SortableContext>
          </Quadrant>
        );
      })}
    </>
  );
};
