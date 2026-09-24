'use client';

import { useEffect, useRef, useState } from 'react';
import { EditTaskDialog } from '@/entities/matrixLayout';
import {
  MatrixKey,
  Tasks,
  editTaskAction,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import { selectTaskAction, useUIStore } from '@/shared/stores/uiStore';
import { ActionToolbar } from '../components/ActionToolbar';
import { useClearSelectionOnEscape } from '../hooks';
import { locateTask, neighbourTaskId } from '../lib';
import { TaskActions, TaskLocation } from '../types';

const getActiveTasks = () => {
  const state = useTaskStore.getState();
  return state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
};

interface TaskActionPanelProps extends TaskActions {
  tasks: Tasks;
}

/** The action panel of the Selected Task and the edit form it opens */
export const TaskActionPanel: React.FC<TaskActionPanelProps> = ({
  tasks,
  completeTask,
  deleteTask,
  moveTask,
}) => {
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
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

  useClearSelectionOnEscape(location !== null);

  if (!location) return null;
  const { task, quadrantKey } = location;

  const handleMove = async (toQuadrant: MatrixKey) => {
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
    if (
      locateTask(tasksNow, task.id)?.quadrantKey === quadrantKey &&
      useUIStore.getState().selectedTaskId === neighbourId
    ) {
      selectTaskAction(task.id);
    }
  };

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
        location={location}
        onComplete={() => completeTask(quadrantKey, task.id)}
        onEdit={() => setEditingTaskId(task.id)}
        onMove={handleMove}
        onDelete={() => deleteTask(quadrantKey, task.id)}
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
