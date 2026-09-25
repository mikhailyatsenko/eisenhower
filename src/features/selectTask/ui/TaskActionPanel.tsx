'use client';

import { RefObject, useEffect, useRef, useState } from 'react';
import { EditTaskDialog } from '@/entities/matrixLayout';
import {
  MatrixKey,
  Tasks,
  editTaskAction,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import {
  requestAddTaskButtonFocusAction,
  requestTaskFocusAction,
  selectTaskAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { ActionToolbar } from '../components/ActionToolbar';
import { ShortcutsDialog } from '../components/ShortcutsDialog';
import {
  useDeselectOnPageClick,
  useFocusAfterAction,
  useMatrixKeys,
} from '../hooks';
import { locateTask, neighbourTaskId, taskCard } from '../lib';
import { TaskActions, TaskLocation } from '../types';

const getActiveTasks = () => {
  const state = useTaskStore.getState();
  return state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
};

interface TaskActionPanelProps extends TaskActions {
  tasks: Tasks;
  /** Takes the focus when the matrix has no task left to focus */
  matrixRef: RefObject<HTMLElement | null>;
}

/**
 * The action panel of the Selected Task, the edit form it opens and the
 * matrix keyboard, which does the same actions
 */
export const TaskActionPanel: React.FC<TaskActionPanelProps> = ({
  tasks,
  matrixRef,
  completeTask,
  deleteTask,
  moveTask,
}) => {
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const isMatrixView = useUIStore((state) => state.viewMode === 'matrix');
  // The inline add field keeps the panel closed while it's open
  const isAddingInline = useUIStore((state) => state.inlineAdd !== null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  // By id: a dialog left open for another task must not pop up on a later selection
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const lastLocation = useRef<TaskLocation | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const found = locateTask(tasks, selectedTaskId);
  // The selected task has left the matrix (Complete, Delete): its neighbour
  // takes over in this very render, so the panel and the focus in it stay
  // put. A change in the cloud drops the selection before this (J1).
  const left =
    !found && lastLocation.current?.task.id === selectedTaskId
      ? lastLocation.current
      : null;
  const location =
    found ?? (left ? locateTask(tasks, neighbourTaskId(tasks, left)) : null);
  // No neighbour: the quadrant is empty, its "Add a task" takes the focus
  const emptiedQuadrant = left && !location ? left.quadrantKey : null;
  const isSelectionStale = selectedTaskId !== null && !found;
  const locatedTaskId = location?.task.id ?? null;

  useEffect(() => {
    lastLocation.current = location;
  });

  useEffect(() => {
    if (isSelectionStale) selectTaskAction(locatedTaskId);
  }, [isSelectionStale, locatedTaskId]);

  useFocusAfterAction(matrixRef, locatedTaskId, emptiedQuadrant);
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
  const handleEdit = () => location && setEditingTaskId(location.task.id);
  // As Esc from the task: the card keeps the focus, not the selection. It's
  // focused while still selected, so its focus doesn't select it again.
  const handleDeselect = () => {
    if (!location) return;
    taskCard(location.task.id)?.focus();
    selectTaskAction(null);
  };

  useMatrixKeys({
    tasks,
    location,
    isMatrixView,
    toolbarRef,
    onComplete: handleComplete,
    onEdit: handleEdit,
    onMove: handleMove,
    onDelete: handleDelete,
    onShowShortcuts: () => setIsShortcutsOpen(true),
  });

  const handleSave = (
    editText: string,
    dueDate: Date | null,
    newQuadrant?: MatrixKey,
  ) => {
    if (!location) return;
    const { task, quadrantKey } = location;
    editTaskAction(quadrantKey, task.id, editText, dueDate, newQuadrant);
    setEditingTaskId(null);
  };

  return (
    <>
      {location && !isAddingInline && (
        <ActionToolbar
          toolbarRef={toolbarRef}
          location={location}
          onComplete={handleComplete}
          onEdit={handleEdit}
          onMove={handleMove}
          onDelete={handleDelete}
          onDeselect={handleDeselect}
        />
      )}

      {location && editingTaskId === location.task.id && (
        <EditTaskDialog
          task={location.task}
          quadrantKey={location.quadrantKey}
          onSave={handleSave}
          onClose={() => setEditingTaskId(null)}
          // Back to the task, wherever the edit has put it, not to the Edit button
          restoreFocus={() => requestTaskFocusAction(location.task.id)}
        />
      )}

      {/* ? works with nothing selected too */}
      {isShortcutsOpen && (
        <ShortcutsDialog onClose={() => setIsShortcutsOpen(false)} />
      )}
    </>
  );
};
