'use client';

import { ListLayout, QuadrantSlots } from '@/entities/matrixLayout';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import { openFormWithCategoryAction } from '@/shared/stores/uiStore';

// Adding in a section: "Add a task" opens the task form there, as 1–4 do in
// List view. The inline field and "+" come to sections later in slice N.
const LIST_SLOTS: QuadrantSlots = {
  headerAction: () => null,
  listEnd: () => null,
  openAddField: (quadrant) => openFormWithCategoryAction(quadrant),
  openAddFieldByEmptySpace: () => {},
};

interface TaskListViewProps {
  tasks: Record<MatrixKey, Task[]>;
  /** Empty sections show their example tasks */
  hasExamples: boolean;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  hasExamples,
}) => <ListLayout tasks={tasks} slots={LIST_SLOTS} hasExamples={hasExamples} />;
