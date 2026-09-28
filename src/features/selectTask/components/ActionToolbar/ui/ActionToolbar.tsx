import { RefObject, useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { DeadlineChooser, deadlineStatus } from '@/entities/matrixLayout';
import { MATRIX_KEYS, QUADRANTS } from '@/shared/consts';
import { useIsPhone, useIsTouchScreen, useNow } from '@/shared/hooks';
import { formatDate } from '@/shared/lib/formatDate';
import { Deadline, Task } from '@/shared/stores/tasksStore';
import { useToastClearance } from '@/shared/ui/toast';
import { TaskActionHandlers, TaskLocation } from '../../../types';
import {
  DEADLINE_STATUS_TEXT,
  PANEL_STYLES,
  PRIMARY_BUTTON,
  QUADRANT_DOT,
} from '../consts';

interface ToolbarBaseProps {
  toolbarRef: RefObject<HTMLDivElement | null>;
  onDelete: () => void;
  /** "×": clears the selection, as Esc does */
  onDeselect: () => void;
}

interface ActiveTaskToolbarProps
  extends ToolbarBaseProps,
    Omit<TaskActionHandlers, 'onDelete'> {
  location: TaskLocation;
  deadlineButtonRef: RefObject<HTMLButtonElement | null>;
  /** The panel shows the deadline choices instead of the actions */
  isChoosingDeadline: boolean;
  onPickDeadline: (deadline: Deadline | null) => void;
  onDeadlineBack: () => void;
}

/** A completed task: Restore and Delete only */
interface CompletedTaskToolbarProps extends ToolbarBaseProps {
  completedTask: Task;
  onRestore: () => void;
}

type ActionToolbarProps = ActiveTaskToolbarProps | CompletedTaskToolbarProps;

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
 * On a phone it is a full-width panel: Complete, Edit, Delete in a row, the
 * deadline under them and Move to as a 2×2 mini-matrix at the bottom. A
 * completed task has Restore and Delete instead. Deadline turns the panel
 * into the deadline choices.
 * Its appearance isn't announced: aria-selected on the task already is.
 */
export const ActionToolbar: React.FC<ActionToolbarProps> = (props) => {
  const { toolbarRef, onDelete, onDeselect } = props;
  const isCompleted = 'completedTask' in props;
  const task = isCompleted ? props.completedTask : props.location.task;
  useToastClearance(toolbarRef);
  const moveToLabelId = useId();
  // Judged by the primary pointer, like the toast: no key hints on touch
  const isTouchScreen = useIsTouchScreen();
  const isPhone = useIsPhone();
  const now = useNow();
  const hint = (label: string) => !isTouchScreen && <KeyHint label={label} />;
  const styles = isPhone ? PANEL_STYLES.phone : PANEL_STYLES.desktop;

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
  const toolbar = (children: React.ReactNode) => (
    <div
      ref={toolbarRef}
      data-action-panel
      role="toolbar"
      aria-label={`Actions for “${task.text}”`}
      className={styles.TOOLBAR}
    >
      {isPhone && (
        <div className={PANEL_STYLES.phone.TASK_ROW}>
          {/* The task may sit under the panel; the toolbar name already says it */}
          <p aria-hidden="true" className={PANEL_STYLES.phone.TASK_TEXT}>
            {task.text}
          </p>
          {deselectButton}
        </div>
      )}
      {children}
    </div>
  );

  if (isCompleted) {
    // No key of its own: Restore is a button only
    const restoreButton = (
      <button
        type="button"
        onClick={props.onRestore}
        className={twMerge(styles.BUTTON, PRIMARY_BUTTON)}
      >
        Restore
      </button>
    );

    return toolbar(
      isPhone ? (
        <div className={PANEL_STYLES.phone.COMPLETED_ACTIONS_ROW}>
          {restoreButton}
          {deleteButton}
        </div>
      ) : (
        <>
          {restoreButton}
          <Divider />
          {deleteButton}
          <Divider />
          {deselectButton}
        </>
      ),
    );
  }

  const {
    location: { quadrantKey },
    onComplete,
    onEdit,
    onDeadline,
    onMove,
    deadlineButtonRef,
    isChoosingDeadline,
    onPickDeadline,
    onDeadlineBack,
  } = props;

  if (isChoosingDeadline) {
    return (
      <div ref={toolbarRef} data-action-panel className={styles.TOOLBAR}>
        <DeadlineChooser
          task={task}
          onPick={onPickDeadline}
          onBack={onDeadlineBack}
        />
      </div>
    );
  }

  const completeButton = (
    <button
      type="button"
      aria-keyshortcuts="C"
      onClick={onComplete}
      className={twMerge(styles.BUTTON, PRIMARY_BUTTON)}
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
  const deadline = task.dueDate && {
    text: formatDate(task.dueDate, {
      hasTime: task.hasDueTime !== false,
      now,
    }),
    status: deadlineStatus(task.dueDate, task.hasDueTime, now),
  };
  const deadlineText = deadline && (
    <span
      className={deadline.status ? DEADLINE_STATUS_TEXT[deadline.status] : ''}
    >
      {deadline.text}
    </span>
  );
  // The status is a word on the card; here its colour only backs it up
  const deadlineButton = (
    <button
      ref={deadlineButtonRef}
      type="button"
      aria-label={deadline ? `Deadline, ${deadline.text}` : 'Deadline'}
      aria-keyshortcuts="D"
      onClick={onDeadline}
      className={twMerge(
        styles.BUTTON,
        isPhone ? PANEL_STYLES.phone.DEADLINE_ROW : 'flex items-center',
      )}
    >
      {isPhone ? (
        <>
          <span>Deadline</span>
          <span className="flex items-center gap-1.5">
            {deadlineText ?? <span className="text-gray-300">None</span>}
            <span aria-hidden="true">›</span>
          </span>
        </>
      ) : (
        <>
          <span aria-hidden="true" className="mr-1.5">
            📅
          </span>
          {deadlineText ?? 'Deadline'}
          {hint('D')}
        </>
      )}
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

  return toolbar(
    isPhone ? (
      <>
        <div className={PANEL_STYLES.phone.ACTIONS_ROW}>
          {completeButton}
          {editButton}
          {deleteButton}
        </div>
        {deadlineButton}
        {moveToGroup}
      </>
    ) : (
      <>
        {completeButton}
        {editButton}
        <Divider />
        {moveToGroup}
        <Divider />
        {deadlineButton}
        <Divider />
        {deleteButton}
        <Divider />
        {deselectButton}
      </>
    ),
  );
};
