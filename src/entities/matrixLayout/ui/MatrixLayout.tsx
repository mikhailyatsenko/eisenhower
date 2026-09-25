import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useId } from 'react';
import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import {
  closeInlineAddAction,
  setFullScreenQuadrantAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { AddTaskButton } from '../components/addTaskButton';
import { Quadrant } from '../components/quadrant';
import { QuadrantExamples } from '../components/quadrantExamples';
import { QuadrantTaskList } from '../components/quadrantTaskList';
import { TaskItem } from '../components/taskItem';
import { useFullScreenQuadrant } from '../hooks';
import { matrixTabStop } from '../lib';
import { QuadrantSlots } from '../types';

interface MatrixLayoutProps {
  tasks: Record<MatrixKey, Task[]>;
  quadrantOrder: MatrixKey[];
  dragOverQuadrant: MatrixKey | null;
  taskInputText: string;
  slots: QuadrantSlots;
  /** Empty quadrants show their example tasks */
  hasExamples: boolean;
}

export const MatrixLayout: React.FC<MatrixLayoutProps> = ({
  tasks,
  quadrantOrder,
  dragOverQuadrant,
  taskInputText,
  slots,
  hasExamples,
}) => {
  const recentlyAddedQuadrant = useUIStore(
    (state) => state.recentlyAddedQuadrant,
  );
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const lastSelectedTaskId = useUIStore((state) => state.lastSelectedTaskId);
  const addTaskTabStop = useUIStore((state) => state.addTaskTabStop);
  const titleIdPrefix = useId();
  // The whole matrix is one Tab stop; the keys move on from there
  const tabStop = matrixTabStop(
    tasks,
    selectedTaskId,
    lastSelectedTaskId,
    addTaskTabStop,
  );
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
            onFullScreenChange={(isOpen) => {
              // Back to matrix closes the add field, which only lives full
              // screen on a phone
              if (!isOpen) closeInlineAddAction();
              setFullScreenQuadrantAction(isOpen ? quadrantKey : null);
            }}
            headerAction={slots.headerAction(quadrantKey)}
            onEmptySpaceClick={() => slots.openAddField(quadrantKey)}
          >
            <SortableContext
              items={quadrantTasks}
              strategy={verticalListSortingStrategy}
            >
              <QuadrantTaskList
                labelledBy={titleId}
                listEnd={
                  <>
                    {taskCount === 0 && hasExamples && (
                      <QuadrantExamples quadrant={quadrantKey} />
                    )}
                    {taskCount === 0 && (
                      <AddTaskButton
                        quadrant={quadrantKey}
                        titleId={titleId}
                        isTabStop={
                          'emptyQuadrant' in tabStop &&
                          tabStop.emptyQuadrant === quadrantKey
                        }
                        onClick={(button) =>
                          slots.openAddField(quadrantKey, button)
                        }
                      />
                    )}
                    {slots.listEnd(quadrantKey)}
                  </>
                }
              >
                {quadrantTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    quadrantKey={quadrantKey}
                    index={index}
                    isTabStop={
                      'taskId' in tabStop && tabStop.taskId === task.id
                    }
                    isFullText={isFullScreen}
                  />
                ))}
              </QuadrantTaskList>
            </SortableContext>
          </Quadrant>
        );
      })}
    </>
  );
};
