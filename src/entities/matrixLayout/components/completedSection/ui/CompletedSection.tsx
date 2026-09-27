import { useEffect, useId, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Task, clearAllCompletedTasksAction } from '@/shared/stores/tasksStore';
import { HEADER_FOCUS_RING } from '../../../consts';
import {
  COMPLETED_SECTION_ATTRIBUTE,
  SECTION_TOGGLE_ATTRIBUTE,
  tasksLabel,
} from '../../../lib';
import { CompletedTaskItem } from '../../completedTaskItem';
import { DeleteAllDialog } from '../../deleteAllDialog';
import { SECTION_HEADER_STYLES } from '../../sectionHeader';
import { COMPLETED_SECTION_STYLES } from '../consts';

interface CompletedSectionProps {
  /** The shown ones, newest first */
  tasks: Task[];
  /** All completed tasks; the section isn't there without them */
  count: number;
  /** Shows the next ones; absent once all are shown */
  onShowMore?: () => void;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  /** Whether the completed task is List view's one Tab stop */
  isTabStop: (taskId: string) => boolean;
}

/**
 * List view's last section: the completed tasks, collapsed by default. Its
 * sticky header has no glyph and no "+", and while expanded offers "Delete
 * all", which asks in a dialog first. Its tasks select as the others do;
 * the action panel restores them. A long list shows in parts, "Show more"
 * adds the next one.
 */
export const CompletedSection: React.FC<CompletedSectionProps> = ({
  tasks,
  count,
  onShowMore,
  isExpanded,
  onExpandedChange,
  isTabStop,
}) => {
  const idPrefix = useId();
  const titleId = `${idPrefix}-title`;
  const listId = `${idPrefix}-list`;
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  // Not a ref prop: React clears that before the dialog closes with the section
  const deleteAllButton = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // "Show more" moves the focus to the first of the tasks it adds
  const firstAddedIndex = useRef<number | null>(null);

  useEffect(() => {
    const index = firstAddedIndex.current;
    if (index === null || tasks.length <= index) return;
    firstAddedIndex.current = null;
    listRef.current
      ?.querySelectorAll<HTMLElement>('[role="option"]')
      [index]?.focus();
  }, [tasks.length]);

  const handleShowMore = () => {
    firstAddedIndex.current = tasks.length;
    onShowMore?.();
  };

  const openDeleteAll = (event: React.MouseEvent<HTMLButtonElement>) => {
    deleteAllButton.current = event.currentTarget;
    setDeleteFailed(false);
    setIsDeleteAllOpen(true);
  };

  // No Undo: the dialog has said it can't be undone. Done, the section goes
  // and the dialog with it.
  const handleConfirmDeleteAll = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      setDeleteFailed(false);
      await clearAllCompletedTasksAction();
      setIsDeleteAllOpen(false);
    } catch (error) {
      console.error('Failed to clear completed tasks:', error);
      setDeleteFailed(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    // "✓ N completed →" brings its top under the top bars
    <div
      {...{ [COMPLETED_SECTION_ATTRIBUTE]: '' }}
      className={COMPLETED_SECTION_STYLES.SECTION}
    >
      <div className={SECTION_HEADER_STYLES.HEADER}>
        <h2 className={SECTION_HEADER_STYLES.HEADING}>
          <button
            type="button"
            aria-label={`Completed, ${tasksLabel(count)}`}
            aria-expanded={isExpanded}
            aria-controls={listId}
            onClick={() => onExpandedChange(!isExpanded)}
            // Arrows on it aren't the list's, as on the other sections' headers
            {...{ [SECTION_TOGGLE_ATTRIBUTE]: '' }}
            className={SECTION_HEADER_STYLES.TOGGLE}
          >
            <span id={titleId} className={COMPLETED_SECTION_STYLES.TITLE}>
              Completed
            </span>
            <span aria-hidden="true" className={SECTION_HEADER_STYLES.COUNT}>
              ({count})
            </span>
            <span
              aria-hidden="true"
              className={twMerge(
                SECTION_HEADER_STYLES.CHEVRON,
                !isExpanded && '-rotate-90',
              )}
            >
              ▾
            </span>
          </button>
        </h2>
        {/* Only while expanded: collapsed, it's easy to hit by mistake */}
        {isExpanded && (
          <button
            type="button"
            onClick={openDeleteAll}
            className={twMerge(
              COMPLETED_SECTION_STYLES.DELETE_ALL,
              HEADER_FOCUS_RING,
            )}
          >
            Delete all
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="motion-safe:animate-menu-fade-in pb-6">
          <ul
            ref={listRef}
            role="listbox"
            id={listId}
            aria-labelledby={titleId}
            className={COMPLETED_SECTION_STYLES.LIST}
          >
            {tasks.map((task) => (
              <CompletedTaskItem
                key={task.id}
                task={task}
                isTabStop={isTabStop(task.id)}
              />
            ))}
          </ul>
          {onShowMore && (
            <button
              type="button"
              onClick={handleShowMore}
              className={twMerge(
                COMPLETED_SECTION_STYLES.SHOW_MORE,
                HEADER_FOCUS_RING,
              )}
            >
              Show more
            </button>
          )}
        </div>
      )}

      {/* In the section's tree, though portaled: when the section goes, the
          dialog closes while "Delete all" is still on the page to take the
          focus, and useFocusAfterAction hands it on from there */}
      {isDeleteAllOpen && (
        <DeleteAllDialog
          count={count}
          isDeleting={isDeleting}
          hasFailed={deleteFailed}
          onConfirm={handleConfirmDeleteAll}
          onCancel={() => setIsDeleteAllOpen(false)}
          restoreFocus={() => deleteAllButton.current?.focus()}
        />
      )}
    </div>
  );
};
