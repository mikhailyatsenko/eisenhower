import { RefObject, useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { MATRIX_KEYS, QUADRANTS } from '@/shared/consts';
import { useIsPhone, useMediaQuery } from '@/shared/hooks';
import { useToastClearance } from '@/shared/ui/toast';
import { TaskActionHandlers, TaskLocation } from '../../../types';
import { PANEL_STYLES, QUADRANT_DOT } from '../consts';

interface ActionToolbarProps extends TaskActionHandlers {
  toolbarRef: RefObject<HTMLDivElement | null>;
  location: TaskLocation;
  /** "×": clears the selection, as Esc does */
  onDeselect: () => void;
}

/** The key that does the button's action right now, on desktop only */
const KeyHint = ({ label }: { label: string }) => (
  <kbd
    aria-hidden="true"
    className="ml-1.5 rounded border border-white/30 px-1 font-sans text-xs text-gray-300"
  >
    {label}
  </kbd>
);

const Divider = () => (
  <span aria-hidden="true" className="mx-1 h-6 w-px bg-white/20" />
);

/**
 * Labelled actions for the Selected Task, pinned to the bottom of the window.
 * On a phone it is a full-width panel: Complete, Edit, Delete in a row and
 * Move to as a 2×2 mini-matrix under them.
 * Its appearance isn't announced: aria-selected on the task already is.
 */
export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  toolbarRef,
  location: { task, quadrantKey },
  onComplete,
  onEdit,
  onMove,
  onDelete,
  onDeselect,
}) => {
  useToastClearance(toolbarRef);
  const moveToLabelId = useId();
  // Judged by the primary pointer, like the toast: no key hints on touch
  const isTouchScreen = useMediaQuery('(hover: none) and (pointer: coarse)');
  const isPhone = useIsPhone();
  const hint = (label: string) => !isTouchScreen && <KeyHint label={label} />;
  const styles = isPhone ? PANEL_STYLES.phone : PANEL_STYLES.desktop;

  const completeButton = (
    <button
      type="button"
      aria-keyshortcuts="C"
      onClick={onComplete}
      className={twMerge(
        styles.BUTTON,
        'bg-green-700 font-bold hover:bg-green-800',
      )}
    >
      Complete
      {hint('C')}
    </button>
  );
  const editButton = (
    <button
      type="button"
      aria-keyshortcuts="E"
      onClick={onEdit}
      className={styles.BUTTON}
    >
      Edit
      {hint('E')}
    </button>
  );
  const deleteButton = (
    <button
      type="button"
      aria-keyshortcuts="Delete"
      onClick={onDelete}
      className={twMerge(styles.BUTTON, 'text-red-300')}
    >
      Delete
      {hint('Del')}
    </button>
  );
  // Named for what it does to the task: the panel only follows the selection
  const deselectButton = (
    <button
      type="button"
      aria-label="Deselect task"
      aria-keyshortcuts="Escape"
      onClick={onDeselect}
      className={twMerge(styles.BUTTON, styles.DESELECT_BUTTON)}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        ×
      </span>
      {hint('Esc')}
    </button>
  );
  const moveToGroup = (
    <div
      role="group"
      aria-labelledby={moveToLabelId}
      className={styles.MOVE_TO}
    >
      <span id={moveToLabelId} className={styles.MOVE_TO_LABEL}>
        Move to
      </span>
      {/* On a phone the buttons sit as the quadrants do in the matrix */}
      <div className={styles.MOVE_TO_GRID}>
        {MATRIX_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={key === quadrantKey}
            aria-keyshortcuts={QUADRANTS[key].shortcut}
            onClick={() => onMove(key)}
            className={twMerge(styles.BUTTON, styles.MOVE_TO_BUTTON)}
          >
            <span
              aria-hidden="true"
              className={twMerge(
                'mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full',
                QUADRANT_DOT[key],
              )}
            />
            {QUADRANTS[key].title}
            {key !== quadrantKey && hint(QUADRANTS[key].shortcut)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label={`Actions for “${task.text}”`}
      className={styles.TOOLBAR}
    >
      {isPhone ? (
        <>
          <div className={PANEL_STYLES.phone.TASK_ROW}>
            {/* The task may sit under the panel; the toolbar name already says it */}
            <p aria-hidden="true" className={PANEL_STYLES.phone.TASK_TEXT}>
              {task.text}
            </p>
            {deselectButton}
          </div>
          <div className={PANEL_STYLES.phone.ACTIONS_ROW}>
            {completeButton}
            {editButton}
            {deleteButton}
          </div>
          {moveToGroup}
        </>
      ) : (
        <>
          {completeButton}
          {editButton}
          <Divider />
          {moveToGroup}
          <Divider />
          {deleteButton}
          <Divider />
          {deselectButton}
        </>
      )}
    </div>
  );
};
