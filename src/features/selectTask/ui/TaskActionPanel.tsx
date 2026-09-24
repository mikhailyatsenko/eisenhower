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
  requestTaskFocusAction,
  selectTaskAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { ActionToolbar } from '../components/ActionToolbar';
import { useFocusAfterAction, useMatrixKeys } from '../hooks';
import { locateTask, neighbourTaskId } from '../lib';
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
  const toolbarRef = useRef<HTMLDivElement>(null);
  // By id: a dialog left open for another task must not pop up on a later selection
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const lastLocation = useRef<TaskLocation | null>(null);

  const found = locateTask(tasks, selectedTaskId);
  // The selected task has left the matrix (Complete, Delete, a change in the
  // cloud): its neighbour takes over in this very render, so the panel and
  // the focus in it stay put
  const left =
    !found && lastLocation.current?.task.id === selectedTaskId
      ? lastLocation.current
      : null;
  const location =
    found ?? (left ? locateTask(tasks, neighbourTaskId(tasks, left)) : null);
  const isSelectionStale = selectedTaskId !== null && !found;
  const locatedTaskId = location?.task.id ?? null;

  useEffect(() => {
    lastLocation.current = location;
  });

  useEffect(() => {
    if (isSelectionStale) selectTaskAction(locatedTaskId);
  }, [isSelectionStale, locatedTaskId]);

  useFocusAfterAction(matrixRef, locatedTaskId);

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

    await moveTask(quadrantKey, task.id, toQuadrant);

    // The move failed or did nothing: the selection goes back to the task,
    // unless the user has picked another one meanwhile
    const tasksNow = getActiveTasks();
    const isUntouched = useUIStore.getState().selectedTaskId === neighbourId;
    const movedTo = locateTask(tasksNow, task.id)?.quadrantKey;
    if (movedTo === quadrantKey && isUntouched) {
      selectTaskAction(task.id);
    } else if (movedTo === toQuadrant && isUntouched && !neighbourId) {
      // Nothing else in the matrix: the task stays selected where it went
      selectTaskAction(task.id);
      const active = document.activeElement;
      if (!active || active === document.body || active === matrixRef.current) {
        requestTaskFocusAction(task.id);
      }
    }
  };

  const handleComplete = () =>
    location && completeTask(location.quadrantKey, location.task.id);
  const handleDelete = () =>
    location && deleteTask(location.quadrantKey, location.task.id);
  const handleEdit = () => location && setEditingTaskId(location.task.id);

  useMatrixKeys({
    tasks,
    location,
    isMatrixView,
    toolbarRef,
    onComplete: handleComplete,
    onEdit: handleEdit,
    onMove: handleMove,
    onDelete: handleDelete,
  });

  if (!location) return null;
  const { task, quadrantKey } = location;

  const handleSave = (
    editText: string,
    dueDate: Date | null,
    newQuadrant?: MatrixKey,
  ) => {
    editTaskAction(quadrantKey, task.id, editText, dueDate, newQuadrant);
    setEditingTaskId(null);
  };

  return (
    <>
      <ActionToolbar
        toolbarRef={toolbarRef}
        location={location}
        onComplete={handleComplete}
        onEdit={handleEdit}
        onMove={handleMove}
        onDelete={handleDelete}
      />

      {editingTaskId === task.id && (
        <EditTaskDialog
          task={task}
          quadrantKey={quadrantKey}
          onSave={handleSave}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </>
  );
};
