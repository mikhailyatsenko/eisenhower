import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useId } from 'react';
import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { InsertTaskZone } from '../components/InsertTaskZone';
import { Quadrant } from '../components/quadrant';
import { TaskItem } from '../components/taskItem';
import { LIST_STYLES, TASK_COUNT_STYLES } from '../consts';
import { tabStopTaskId } from '../lib';

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
  const recentlyAddedQuadrant = useUIStore(
    (state) => state.recentlyAddedQuadrant,
  );
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const lastSelectedTaskId = useUIStore((state) => state.lastSelectedTaskId);
  const titleIdPrefix = useId();
  // The whole matrix is one Tab stop; the keys move on from there
  const tabStopId = tabStopTaskId(tasks, selectedTaskId, lastSelectedTaskId);

  return (
    <>
      {MATRIX_KEYS.map((quadrantKey) => {
        const quadrantTasks = tasks[quadrantKey];
        const taskCount = quadrantTasks.length;
        const taskCountText = `${taskCount} task${taskCount !== 1 ? 's' : ''}`;
        const titleId = `${titleIdPrefix}-${quadrantKey}`;

        return (
          <Quadrant
            isAnimateByExpandQuadrant={isAnimateByExpandQuadrant}
            handleToggleExpand={handleToggleExpand}
            expandedQuadrant={expandedQuadrant}
            key={quadrantKey}
            quadrantKey={quadrantKey}
            titleId={titleId}
            isDragOver={dragOverQuadrant === quadrantKey}
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
                role="listbox"
                aria-labelledby={titleId}
                className={
                  expandedQuadrant === quadrantKey
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
                      task={task}
                      quadrantKey={quadrantKey}
                      index={index}
                      isTabStop={task.id === tabStopId}
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
                {expandedQuadrant !== quadrantKey && taskCountText}
              </p>
            </SortableContext>
          </Quadrant>
        );
      })}
    </>
  );
};
