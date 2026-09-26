'use client';

import { InlineAddField, QuadrantAddButton } from '@/features/addTask';
import { ListLayout, QuadrantSlots } from '@/entities/matrixLayout';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import {
  openInlineAddAction,
  openInlineAddByEmptySpaceAction,
} from '@/shared/stores/uiStore';

// Adding in a section, as in a quadrant: its "+", the inline field at the
// end of the section, a click on empty space and "Add a task". The page
// scrolls to the field: a section doesn't scroll by itself.
const LIST_SLOTS: QuadrantSlots = {
  headerAction: (quadrant) => <QuadrantAddButton quadrant={quadrant} />,
  listEnd: (quadrant) => <InlineAddField quadrant={quadrant} scrollsPage />,
  openAddField: openInlineAddAction,
  openAddFieldByEmptySpace: openInlineAddByEmptySpaceAction,
};

interface TaskListViewProps {
  tasks: Record<MatrixKey, Task[]>;
  /** Newest first */
  completedTasks: Task[];
  /** Empty sections show their example tasks */
  hasExamples: boolean;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  completedTasks,
  hasExamples,
}) => (
  <ListLayout
    tasks={tasks}
    completedTasks={completedTasks}
    slots={LIST_SLOTS}
    hasExamples={hasExamples}
  />
);
