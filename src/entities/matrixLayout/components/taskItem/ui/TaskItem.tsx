import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { twMerge } from 'tailwind-merge';

import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';
import {
  OPTION_SELECTION_CLASS,
  TASK_CARD_CLASS,
  colors,
} from '../../../consts';
import { useDeadlineStatus, useSelectableTask } from '../../../hooks';
import { OVERDUE_STRIPE_CLASS } from '../../deadlineLine';
import {
  CARD_LAYOUT_CLASS,
  CardLayout,
  TaskCardContent,
} from '../../taskCardContent';

interface TaskItemProps {
  task: Task;
  quadrantKey: MatrixKey;
  index: number;
  /** The matrix's one Tab stop */
  isTabStop: boolean;
  layout: CardLayout;
}

/**
 * A task in the matrix or List view: click or tap selects it, a drag moves it
 * where the list is in a DndContext
 */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  quadrantKey,
  index,
  isTabStop,
  layout,
}) => {
  const { isSelected, itemRef, handlers } = useSelectableTask(task.id);
  const status = useDeadlineStatus(task);
  // Its text edited in the action panel: the card shows the draft
  const draft = useUIStore((state) =>
    state.textEdit?.taskId === task.id ? state.textEdit.draft : null,
  );

  // No dnd-kit attributes: the card is an option, not a sortable button
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { quadrantKey, index },
    });

  const setItemRef = (node: HTMLLIElement | null) => {
    itemRef.current = node;
    setNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <li
      ref={setItemRef}
      role="option"
      data-task-id={task.id}
      aria-selected={isSelected}
      tabIndex={isTabStop ? 0 : -1}
      {...listeners}
      {...handlers}
      style={style}
      className={twMerge(
        TASK_CARD_CLASS,
        colors[quadrantKey],
        status === 'overdue' && OVERDUE_STRIPE_CLASS,
        'cursor-pointer outline-none',
        CARD_LAYOUT_CLASS[layout].card,
        isDragging && 'opacity-50',
        isSelected
          ? OPTION_SELECTION_CLASS.selected
          : OPTION_SELECTION_CLASS.idle,
      )}
    >
      <TaskCardContent
        task={task}
        status={status}
        layout={layout}
        draft={draft}
      />
    </li>
  );
};
