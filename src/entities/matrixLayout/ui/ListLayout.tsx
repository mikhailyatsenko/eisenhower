import { useId } from 'react';
import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import {
  selectTaskAction,
  setCompletedExpandedAction,
  setSectionCollapsedAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { AddTaskButton } from '../components/addTaskButton';
import { CompletedSection } from '../components/completedSection';
import { QuadrantExamples } from '../components/quadrantExamples';
import { SectionHeader } from '../components/sectionHeader';
import { TaskItem } from '../components/taskItem';
import { useEmptySpaceClick } from '../hooks';
import {
  MatrixStop,
  isSameStop,
  isSectionCollapsed,
  listTabStop,
} from '../lib';
import { QuadrantSlots } from '../types';

interface ListLayoutProps {
  tasks: Record<MatrixKey, Task[]>;
  /** The shown completed tasks, newest first */
  completedTasks: Task[];
  /** All completed tasks: the last section, while there are any */
  completedCount: number;
  /** Shows the next completed tasks; absent once all are shown */
  onShowMoreCompleted?: () => void;
  slots: QuadrantSlots;
  /** Empty sections show their example tasks */
  hasExamples: boolean;
}

/**
 * List view: the matrix read from top to bottom, one section per quadrant in
 * the matrix order, its tasks in the quadrant's order. A section collapses to
 * its header; an empty one always shows open. A click on a section's empty
 * space, between the tasks or after the last one, adds there as in a
 * quadrant. Completed comes last, collapsed by default. No drag: the list
 * is mounted outside a DndContext.
 */
export const ListLayout: React.FC<ListLayoutProps> = ({
  tasks,
  completedTasks,
  completedCount,
  onShowMoreCompleted,
  slots,
  hasExamples,
}) => {
  const collapsedSections = useUIStore((state) => state.collapsedSections);
  const isCompletedExpanded = useUIStore((state) => state.isCompletedExpanded);
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const lastSelectedTaskId = useUIStore((state) => state.lastSelectedTaskId);
  const addTaskTabStop = useUIStore((state) => state.addTaskTabStop);
  const idPrefix = useId();

  const isCollapsed = (quadrant: MatrixKey) =>
    isSectionCollapsed(tasks, collapsedSections, quadrant);

  const tabStop = listTabStop(
    tasks,
    collapsedSections,
    isCompletedExpanded ? completedTasks : [],
    selectedTaskId,
    lastSelectedTaskId,
    addTaskTabStop,
  );
  const isTabStop = (stop: MatrixStop) =>
    tabStop !== null && isSameStop(tabStop, stop);

  const handleCollapsedChange = (quadrant: MatrixKey, collapse: boolean) => {
    // The Selected Task goes out of sight with its section
    const hidesSelection =
      collapse && tasks[quadrant].some(({ id }) => id === selectedTaskId);
    if (hidesSelection) selectTaskAction(null);
    setSectionCollapsedAction(quadrant, collapse);
  };
  const handleCompletedExpandedChange = (expand: boolean) => {
    const hidesSelection =
      !expand && completedTasks.some(({ id }) => id === selectedTaskId);
    if (hidesSelection) selectTaskAction(null);
    setCompletedExpandedAction(expand);
  };
  const handleEmptySpaceClick = useEmptySpaceClick();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-1">
      {MATRIX_KEYS.map((quadrant) => {
        const quadrantTasks = tasks[quadrant];
        const taskCount = quadrantTasks.length;
        const titleId = `${idPrefix}-${quadrant}-title`;
        const listId = `${idPrefix}-${quadrant}-list`;
        const collapsed = isCollapsed(quadrant);

        return (
          <div key={quadrant}>
            <SectionHeader
              quadrant={quadrant}
              titleId={titleId}
              listId={listId}
              taskCount={taskCount}
              isCollapsed={collapsed}
              onCollapsedChange={(collapse) =>
                handleCollapsedChange(quadrant, collapse)
              }
              headerAction={slots.headerAction(quadrant)}
            />

            {!collapsed && (
              // Its empty space: the gaps between the tasks and the room
              // after the last one
              <div
                className="motion-safe:animate-menu-fade-in pb-6"
                onClick={(event) =>
                  handleEmptySpaceClick(event, () =>
                    slots.openAddFieldByEmptySpace(quadrant),
                  )
                }
              >
                <ul
                  role="listbox"
                  id={listId}
                  aria-labelledby={titleId}
                  className="flex list-none flex-col gap-2 pt-1"
                >
                  {quadrantTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      quadrantKey={quadrant}
                      index={index}
                      isTabStop={isTabStop({ taskId: task.id })}
                      layout="row"
                    />
                  ))}
                </ul>

                {taskCount === 0 && (
                  <div className="rounded-md border border-dashed border-gray-400 px-2 py-3 dark:border-gray-600">
                    {hasExamples && <QuadrantExamples quadrant={quadrant} />}
                    <AddTaskButton
                      quadrant={quadrant}
                      titleId={titleId}
                      isTabStop={isTabStop({ emptyQuadrant: quadrant })}
                      onClick={(button) => slots.openAddField(quadrant, button)}
                    />
                  </div>
                )}
                {slots.listEnd(quadrant)}
              </div>
            )}
          </div>
        );
      })}

      {completedCount > 0 && (
        <CompletedSection
          tasks={completedTasks}
          count={completedCount}
          onShowMore={onShowMoreCompleted}
          isExpanded={isCompletedExpanded}
          onExpandedChange={handleCompletedExpandedChange}
          isTabStop={(taskId) => isTabStop({ taskId })}
        />
      )}
    </div>
  );
};
