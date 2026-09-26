import { twMerge } from 'tailwind-merge';
import { QUADRANTS } from '@/shared/consts';
import { useNow } from '@/shared/hooks';
import { formatDate } from '@/shared/lib/formatDate';
import { RESTORE_FALLBACK_QUADRANT, Task } from '@/shared/stores/tasksStore';
import { OPTION_SELECTION_CLASS } from '../../../consts';
import { useSelectableTask } from '../../../hooks';
import { COMPLETED_ROW_STYLES, QUADRANT_DOT_CLASS } from '../consts';

interface CompletedTaskItemProps {
  task: Task;
  /** List view's one Tab stop */
  isTabStop: boolean;
}

/**
 * A completed task in its section: the text struck through, the quadrant in
 * words and when it was completed. No buttons: selecting it opens Restore
 * and Delete in the action panel.
 */
export const CompletedTaskItem: React.FC<CompletedTaskItemProps> = ({
  task,
  isTabStop,
}) => {
  const { isSelected, itemRef, handlers } = useSelectableTask(task.id);
  const now = useNow();
  // Before R1 a task didn't remember its quadrant: the one Restore puts it in
  const quadrant = task.quadrantKey ?? RESTORE_FALLBACK_QUADRANT;

  return (
    <li
      ref={itemRef}
      role="option"
      data-task-id={task.id}
      aria-selected={isSelected}
      tabIndex={isTabStop ? 0 : -1}
      {...handlers}
      className={twMerge(
        COMPLETED_ROW_STYLES.ROW,
        isSelected
          ? OPTION_SELECTION_CLASS.selected
          : OPTION_SELECTION_CLASS.idle,
      )}
    >
      <div className={COMPLETED_ROW_STYLES.TEXT}>{task.text}</div>
      <div className={COMPLETED_ROW_STYLES.DETAILS}>
        <span className={COMPLETED_ROW_STYLES.QUADRANT}>
          <span
            aria-hidden="true"
            className={twMerge(
              COMPLETED_ROW_STYLES.DOT,
              QUADRANT_DOT_CLASS[quadrant],
            )}
          />
          {QUADRANTS[quadrant].title}
        </span>{' '}
        {task.completedAt && (
          <span>
            Completed {formatDate(task.completedAt, { hasTime: true, now })}
          </span>
        )}
      </div>
    </li>
  );
};
