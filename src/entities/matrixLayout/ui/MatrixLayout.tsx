import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React from 'react';
import { MatrixKey, MatrixQuadrants, Task } from '@/shared/stores/tasksStore';
import {
  editTaskAction,
  deleteTaskAction,
  completeTaskAction,
} from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { InsertTaskZone } from '../components/InsertTaskZone';
import { Quadrant } from '../components/quadrant';
import { TaskItem } from '../components/taskItem';
import { LIST_STYLES, TASK_COUNT_STYLES } from '../consts';

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
        const quadrantTasks = tasks[quadrantKey];
        const taskCount = quadrantTasks.length;
        const taskCountText = `${taskCount} task${taskCount !== 1 ? 's' : ''}`;

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
            isNoTasks={taskCount === 0}
          >
            <SortableContext
              items={quadrantTasks}
              strategy={verticalListSortingStrategy}
            >
              <ul
                className={
                  expandedQuadrant === key
                    ? LIST_STYLES.EXPANDED
                    : LIST_STYLES.COLLAPSED
                }
              >
                {/* Top Insert Zone */}
                {taskCount > 0 && (
                  <InsertTaskZone quadrantKey={quadrantKey} index={0} />
                )}

                {quadrantTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <TaskItem
                      deleteTaskAction={deleteTaskAction}
                      editTaskAction={editTaskAction}
                      completeTaskAction={completeTaskAction}
                      task={task}
                      quadrantKey={quadrantKey}
                      index={index}
                    />
                    {/* Intermediate and Bottom Insert Zone */}
                    <InsertTaskZone
                      quadrantKey={quadrantKey}
                      index={index + 1}
                    />
                  </React.Fragment>
                ))}
              </ul>

              <p
                className={
                  taskCount === 0
                    ? TASK_COUNT_STYLES.EMPTY
                    : TASK_COUNT_STYLES.DEFAULT
                }
              >
                {expandedQuadrant !== key && taskCountText}
              </p>
            </SortableContext>
          </Quadrant>
        );
      })}
    </>
  );
};
