import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import {
  selectTaskAction,
  useTaskFocusRequest,
  useUIStore,
} from '@/shared/stores/uiStore';
import { TASK_CARD_CLASS, colors } from '../../../consts';
import { TaskCardContent } from '../../taskCardContent';

interface TaskItemProps {
  task: Task;
  quadrantKey: MatrixKey;
  index: number;
  /** The matrix's one Tab stop */
  isTabStop: boolean;
  /** In a quadrant open full screen the text isn't cut */
  isFullText: boolean;
}

/** A task in the matrix: click or tap selects it, a drag moves it */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  quadrantKey,
  index,
  isTabStop,
  isFullText,
}) => {
  const isSelected = useUIStore((state) => state.selectedTaskId === task.id);

  // No dnd-kit attributes: the card is an option, not a sortable button
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { quadrantKey, index },
    });

  const itemRef = useRef<HTMLLIElement | null>(null);
  useTaskFocusRequest(task.id, itemRef);
  const setItemRef = (node: HTMLLIElement | null) => {
    itemRef.current = node;
    setNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  // A press focuses the card before its click: the click decides then
  const isPointerFocus = useRef(false);

  const handleClick = (event: React.MouseEvent) => {
    // A click on the quadrant's empty space clears the selection
    event.stopPropagation();
    isPointerFocus.current = false;
    selectTaskAction(isSelected ? null : task.id);
  };

  const handlePointerDown = () => {
    isPointerFocus.current = true;
  };

  // A press that became a drag never clicks
  const handleBlur = () => {
    isPointerFocus.current = false;
  };

  // Focus and selection coincide: Tab or the keys select the focused task
  const handleFocus = () => {
    if (isPointerFocus.current) {
      isPointerFocus.current = false;
      return;
    }
    if (!isSelected) selectTaskAction(task.id);
  };

  return (
    <li
      ref={setItemRef}
      role="option"
      data-task-id={task.id}
      aria-selected={isSelected}
      tabIndex={isTabStop ? 0 : -1}
      {...listeners}
      onPointerDown={handlePointerDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      style={style}
      className={twMerge(
        TASK_CARD_CLASS,
        colors[quadrantKey],
        'cursor-pointer outline-none',
        isDragging && 'opacity-50',
        isSelected
          ? 'ring-2 ring-indigo-700 ring-offset-2 dark:ring-indigo-300 dark:ring-offset-gray-950'
          : 'hover:ring-1 hover:ring-gray-500',
      )}
    >
      <TaskCardContent task={task} isFullText={isFullText} />
    </li>
  );
};
