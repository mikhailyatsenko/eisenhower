import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useId } from 'react';
import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import {
  setFullScreenQuadrantAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { InsertTaskZone } from '../components/InsertTaskZone';
import { Quadrant } from '../components/quadrant';
import { QuadrantTaskList } from '../components/quadrantTaskList';
import { TaskItem } from '../components/taskItem';
import { useFullScreenQuadrant } from '../hooks';
import { tabStopTaskId } from '../lib';

interface MatrixLayoutProps {
  tasks: Record<MatrixKey, Task[]>;
  quadrantOrder: MatrixKey[];
  dragOverQuadrant: MatrixKey | null;
  taskInputText: string;
}

export const MatrixLayout: React.FC<MatrixLayoutProps> = ({
  tasks,
  quadrantOrder,
  dragOverQuadrant,
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
  const { fullScreenQuadrant, isPhone } = useFullScreenQuadrant(tasks);
  const shownQuadrants = fullScreenQuadrant
    ? [fullScreenQuadrant]
    : MATRIX_KEYS;

  return (
    <>
      {shownQuadrants.map((quadrantKey) => {
        const quadrantTasks = tasks[quadrantKey];
        const taskCount = quadrantTasks.length;
        const titleId = `${titleIdPrefix}-${quadrantKey}`;
        const isFullScreen = quadrantKey === fullScreenQuadrant;

        return (
          <Quadrant
            key={quadrantKey}
            quadrantKey={quadrantKey}
            titleId={titleId}
            isDragOver={dragOverQuadrant === quadrantKey}
            orderIndex={quadrantOrder.indexOf(quadrantKey)}
            isTypingNewTask={taskInputText.trim() !== ''}
            recentlyAddedQuadrant={recentlyAddedQuadrant}
            taskCount={taskCount}
            fullScreen={isFullScreen ? 'open' : isPhone ? 'closed' : 'off'}
            onFullScreenChange={(isOpen) =>
              setFullScreenQuadrantAction(isOpen ? quadrantKey : null)
            }
          >
            <SortableContext
              items={quadrantTasks}
              strategy={verticalListSortingStrategy}
            >
              <QuadrantTaskList labelledBy={titleId}>
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
                      isFullText={isFullScreen}
                    />
                    {/* Intermediate and Bottom Insert Zone */}
                    <InsertTaskZone
                      quadrantKey={quadrantKey}
                      index={index + 1}
                    />
                  </React.Fragment>
                ))}
              </QuadrantTaskList>
            </SortableContext>
          </Quadrant>
        );
      })}
    </>
  );
};
