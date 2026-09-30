'use client';

import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Deadline,
  MatrixKey,
  Task,
  Tasks,
  editTaskAction,
  selectTasks,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import {
  closeTextEditAction,
  requestAddTaskButtonFocusAction,
  selectTaskAction,
  startTextEditAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { ActionToolbar } from '../components/ActionToolbar';
import { ShortcutsDialog } from '../components/ShortcutsDialog';
import {
  useDeselectOnPageClick,
  useFocusAfterAction,
  useMatrixKeys,
} from '../hooks';
import {
  lastShownTaskId,
  locateCompleted,
  locateTask,
  neighbourTaskId,
  taskCard,
} from '../lib';
import {
  CompletedLocation,
  DeadlineFocusReturn,
  TaskActions,
  TaskLocation,
} from '../types';

const getActiveTasks = () => selectTasks(useTaskStore.getState());

interface TaskActionPanelProps extends TaskActions {
  tasks: Tasks;
  /** What Completed shows, newest first: none in the matrix or while it's collapsed */
  shownCompleted: Task[];
  /** Takes the focus when the matrix has no task left to focus */
  matrixRef: RefObject<HTMLElement | null>;
}

const isInQuadrant = (
  location: TaskLocation | CompletedLocation,
): location is TaskLocation => 'quadrantKey' in location;

/**
 * The action panel of the Selected Task, the text field and the deadline
 * choices it turns into, and the matrix keyboard, which does the same
 * actions. A completed task has Restore and Delete only.
 */
export const TaskActionPanel: React.FC<TaskActionPanelProps> = ({
  tasks,
  shownCompleted,
  matrixRef,
  completeTask,
  deleteTask,
  moveTask,
  restoreTask,
  deleteCompletedTask,
}) => {
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const isMatrixView = useUIStore((state) => state.viewMode === 'matrix');
  // The inline add field keeps the panel closed while it's open
  const isAddingInline = useUIStore((state) => state.inlineAdd !== null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  // In the store: the card shows the draft. By id, so the field doesn't come
  // back on a later selection.
  const textEditTaskId = useUIStore((state) => state.textEdit?.taskId ?? null);
  const lastLocation = useRef<TaskLocation | CompletedLocation | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const isDraggingTask = useUIStore((state) => state.isDraggingTask);
  const deadlineButtonRef = useRef<HTMLButtonElement>(null);
  // By id, like the text edit: the choices don't come back on a later selection
  const [deadlineChoice, setDeadlineChoice] = useState<{
    taskId: string;
    returnTo: DeadlineFocusReturn;
  } | null>(null);
  const pendingFocusReturn = useRef<DeadlineFocusReturn | null>(null);

  // Where the focus goes once Completed has emptied
  const lastListTaskId = () =>
    lastShownTaskId(tasks, useUIStore.getState().collapsedSections);

  const found = locateTask(tasks, selectedTaskId);
  const foundCompleted = locateCompleted(shownCompleted, selectedTaskId);
  // The selected task has left its place (Complete, Delete, Restore): its
  // neighbour takes over in this very render, so the panel and the focus in
  // it stay put. A change in the cloud drops the selection before this (J1).
  const wasSelected =
    lastLocation.current?.task.id === selectedTaskId
      ? lastLocation.current
      : null;
  const leftQuadrant =
    wasSelected && isInQuadrant(wasSelected) && !found ? wasSelected : null;
  const leftCompleted =
    wasSelected && !isInQuadrant(wasSelected) && !foundCompleted
      ? wasSelected
      : null;

  let location: TaskLocation | null = null;
  let completedLocation: CompletedLocation | null = null;
  if (leftQuadrant) {
    location = locateTask(tasks, neighbourTaskId(tasks, leftQuadrant));
  } else if (leftCompleted) {
    // The next completed task, else the previous one; Completed emptied:
    // the last task of the open sections, else the List view itself
    const { index } = leftCompleted;
    completedLocation = locateCompleted(
      shownCompleted,
      (shownCompleted[index] ?? shownCompleted[index - 1])?.id ?? null,
    );
    if (!completedLocation) {
      location = locateTask(tasks, lastListTaskId());
    }
  } else {
    location = found;
    completedLocation = found ? null : foundCompleted;
  }
  // No neighbour: the quadrant is empty, its "Add a task" takes the focus
  const emptiedQuadrant =
    leftQuadrant && !location ? leftQuadrant.quadrantKey : null;
  const locatedTaskId = location?.task.id ?? completedLocation?.task.id ?? null;
  const isSelectionStale =
    selectedTaskId !== null && selectedTaskId !== locatedTaskId;

  useEffect(() => {
    lastLocation.current = location ?? completedLocation;
  });

  useEffect(() => {
    if (isSelectionStale) selectTaskAction(locatedTaskId);
  }, [isSelectionStale, locatedTaskId]);

  const isChoosingDeadline =
    location !== null && deadlineChoice?.taskId === location.task.id;
  const isEditingText =
    location !== null && textEditTaskId === location.task.id;

  // Another task, no selection (another view, a removal on another device
  // too) or a drag: the choices and the text field close with nothing saved
  useEffect(() => {
    setDeadlineChoice(null);
    closeTextEditAction();
  }, [selectedTaskId, isDraggingTask]);

  // Before useFocusAfterAction's effect: the focus leaves the choices and
  // the text field for the task or the button, never for the page
  useLayoutEffect(() => {
    const returnTo = pendingFocusReturn.current;
    if (!returnTo || isChoosingDeadline || isEditingText) return;
    pendingFocusReturn.current = null;
    if (returnTo === 'button') deadlineButtonRef.current?.focus();
    else if (locatedTaskId) taskCard(locatedTaskId)?.focus();
  });

  useFocusAfterAction(
    matrixRef,
    locatedTaskId,
    emptiedQuadrant,
    lastListTaskId,
  );
  useDeselectOnPageClick();

  const handleMove = async (toQuadrant: MatrixKey) => {
    if (!location) return;
    const { task, quadrantKey } = location;
    // Selecting the neighbour first keeps the pressed button enabled and focused
    const withoutTask = {
      ...tasks,
      [quadrantKey]: tasks[quadrantKey].filter(({ id }) => id !== task.id),
    };
    const neighbourId = neighbourTaskId(withoutTask, location);
    selectTaskAction(neighbourId);
    // The last task leaves: the quadrant's "Add a task" takes the focus as
    // soon as it shows
    if (!neighbourId) requestAddTaskButtonFocusAction(quadrantKey);

    await moveTask(quadrantKey, task.id, toQuadrant);

    // The move failed or did nothing: the selection goes back to the task,
    // unless the user has picked another one meanwhile
    const isUntouched = useUIStore.getState().selectedTaskId === neighbourId;
    const movedTo = locateTask(getActiveTasks(), task.id)?.quadrantKey;
    if (movedTo === quadrantKey && isUntouched) {
      if (!neighbourId) requestAddTaskButtonFocusAction(null);
      selectTaskAction(task.id);
    }
  };

  const handleComplete = () =>
    location && completeTask(location.quadrantKey, location.task.id);
  const handleDelete = () =>
    location && deleteTask(location.quadrantKey, location.task.id);
  const handleEdit = () =>
    location && startTextEditAction(location.task.id, location.task.text);
  const closeTextEdit = () => {
    pendingFocusReturn.current = 'task';
    closeTextEditAction();
  };
  // As the chosen deadline: the deadline and the quadrant stay, no toast and
  // no Undo. An unchanged text isn't written.
  const handleSaveText = (text: string) => {
    if (!location) return;
    const { task, quadrantKey } = location;
    if (text !== task.text) editTaskAction(quadrantKey, task.id, text);
    closeTextEdit();
  };
  const openDeadline = (returnTo: DeadlineFocusReturn) =>
    location && setDeadlineChoice({ taskId: location.task.id, returnTo });
  const closeDeadline = () => {
    pendingFocusReturn.current = deadlineChoice?.returnTo ?? null;
    setDeadlineChoice(null);
  };
  // As it is, the text and the quadrant too; no toast and no Undo
  const handlePickDeadline = (deadline: Deadline | null) => {
    if (!location) return;
    const { task, quadrantKey } = location;
    editTaskAction(quadrantKey, task.id, task.text, deadline);
    closeDeadline();
  };
  const handleRestore = () =>
    completedLocation && restoreTask(completedLocation.task);
  const handleDeleteCompleted = () =>
    completedLocation && deleteCompletedTask(completedLocation.task.id);
  // As Esc from the task: the card keeps the focus, not the selection. It's
  // focused while still selected, so its focus doesn't select it again.
  const handleDeselect = () => {
    if (!locatedTaskId) return;
    taskCard(locatedTaskId)?.focus();
    selectTaskAction(null);
  };

  useMatrixKeys({
    tasks,
    shownCompleted,
    location,
    completedLocation,
    onDeleteCompleted: handleDeleteCompleted,
    isMatrixView,
    toolbarRef,
    isChoosingDeadline,
    isEditingText,
    onComplete: handleComplete,
    onEdit: handleEdit,
    onDeadline: openDeadline,
    onMove: handleMove,
    onDelete: handleDelete,
    onShowShortcuts: () => setIsShortcutsOpen(true),
  });

  return (
    <>
      {completedLocation && !isAddingInline && (
        <ActionToolbar
          // Its own toolbar: the focus in the other one doesn't carry over
          key="completed"
          toolbarRef={toolbarRef}
          completedTask={completedLocation.task}
          onRestore={handleRestore}
          onDelete={handleDeleteCompleted}
          onDeselect={handleDeselect}
        />
      )}
      {location && !isAddingInline && (
        <ActionToolbar
          key="active"
          toolbarRef={toolbarRef}
          location={location}
          onComplete={handleComplete}
          onEdit={handleEdit}
          onDeadline={openDeadline}
          deadlineButtonRef={deadlineButtonRef}
          isChoosingDeadline={isChoosingDeadline}
          onPickDeadline={handlePickDeadline}
          onDeadlineBack={closeDeadline}
          isEditingText={isEditingText}
          onSaveText={handleSaveText}
          onTextBack={closeTextEdit}
          onMove={handleMove}
          onDelete={handleDelete}
          onDeselect={handleDeselect}
        />
      )}

      {/* ? works with nothing selected too */}
      {isShortcutsOpen && (
        <ShortcutsDialog onClose={() => setIsShortcutsOpen(false)} />
      )}
    </>
  );
};
