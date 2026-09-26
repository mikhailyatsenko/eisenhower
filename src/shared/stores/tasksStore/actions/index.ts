import { v4 as uuidv4 } from 'uuid';

import { RESTORE_FALLBACK_QUADRANT } from '../consts';
import { useTaskStore } from '../hooks/useTasksStore';
import {
  actionChanges,
  reorderedQuadrants,
  selectCompletedTasks,
  selectTasks,
} from '../lib';
import { MatrixKey, Revert, Task, TaskArea, Tasks } from '../types';
import { writeToCloud } from './cloudSync';

export {
  subscribeToCloudMatrix,
  reloadCloudMatrixAction,
  holdCloudSnapshotsAction,
  releaseCloudSnapshotsAction,
} from './cloudSync';

// Actions change the current Matrix at once and don't wait for the cloud: the
// write goes to the sync model, the device has it already

const isInCloud = () => useTaskStore.getState().isInCloud;

/** Writes the changed tasks, in one batch with the order of the areas they touched */
const writeChanged = (changedIds: string[], areas: TaskArea[]) => {
  const { firebaseTasks, firebaseCompletedTasks } = useTaskStore.getState();
  const changes = actionChanges(
    { tasks: firebaseTasks, completedTasks: firebaseCompletedTasks },
    changedIds,
    areas,
  );
  writeToCloud(changes);

  // The store holds the written order before the snapshot brings it: the
  // next action compares against it, even a quick Undo
  const written = new Map(
    changes.flatMap((change) =>
      change.type === 'set' ? [[change.task.id, change.order] as const] : [],
    ),
  );
  useTaskStore.setState((state) => {
    [
      ...Object.values(state.firebaseTasks).flat(),
      ...state.firebaseCompletedTasks,
    ].forEach((task) => {
      const order = written.get(task.id);
      if (order !== undefined) task.order = order;
    });
  });
};

const deleteFromCloud = (taskId: string) =>
  writeToCloud([{ type: 'delete', id: taskId }]);

export const addTaskAction = async (
  quadrantKey: MatrixKey,
  taskInputText: string,
  dueDate?: Date | null,
) => {
  if (taskInputText.length > 200) return;
  const taskId = uuidv4();
  const newTask: Task = {
    id: taskId,
    text: taskInputText,
    createdAt: new Date(),
    dueDate: dueDate || undefined,
  };
  useTaskStore.setState((state) => {
    const tasks = selectTasks(state);
    tasks[quadrantKey].push(newTask);
  });
  if (isInCloud()) {
    writeChanged([taskId], [quadrantKey]);
  }
  return taskId;
};

export const editTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
  newText: string,
  newDueDate?: Date | null,
  newQuadrantKey?: MatrixKey,
) => {
  let isChanged = false;
  const areas: MatrixKey[] = [quadrantKey];

  useTaskStore.setState((state) => {
    const tasks = selectTasks(state);

    // Find the task in the original quadrant
    const taskIndex = tasks[quadrantKey].findIndex((t) => t.id === taskId);

    if (taskIndex !== -1) {
      const task = tasks[quadrantKey][taskIndex];

      const textChanged = task.text !== newText;
      const dateChanged = task.dueDate?.getTime() !== newDueDate?.getTime();
      const quadrantChanged = newQuadrantKey && newQuadrantKey !== quadrantKey;

      if (textChanged || dateChanged || quadrantChanged) {
        task.text = newText;
        task.dueDate =
          newDueDate === null ? undefined : newDueDate || task.dueDate;

        if (quadrantChanged && newQuadrantKey) {
          const [movedTask] = tasks[quadrantKey].splice(taskIndex, 1);
          movedTask.quadrantKey = newQuadrantKey;
          tasks[newQuadrantKey].push(movedTask);
          areas.push(newQuadrantKey);
        }

        isChanged = true;
      }
    }
  });

  if (isChanged) {
    if (isInCloud()) {
      writeChanged([taskId], areas);
    }
  }
};

/** Drag preview: moves the task on screen only, without sync or Undo */
export const dragOverQuadrantAction = (
  taskId: string,
  fromQuadrant: MatrixKey,
  toQuadrant: MatrixKey,
  index?: number,
) => {
  useTaskStore.setState((state) => {
    const tasks = selectTasks(state);
    const activeItems = tasks[fromQuadrant];
    const overItems = tasks[toQuadrant];

    const activeIndex = activeItems.findIndex(
      (item: Task) => item.id === taskId,
    );

    if (activeIndex !== -1) {
      const [movedTask] = activeItems.splice(activeIndex, 1);
      if (typeof index === 'number') {
        overItems.splice(index, 0, movedTask);
      } else {
        overItems.push(movedTask);
      }
    }
  });
};

export const dragEndAction = async (newTasks: Tasks) => {
  const { isInCloud: inCloud, firebaseTasks } = useTaskStore.getState();
  useTaskStore.setState((state) => {
    if (inCloud) {
      state.firebaseTasks = newTasks;
    } else {
      state.localTasks = newTasks;
    }
  });

  if (inCloud) {
    writeChanged([], reorderedQuadrants(firebaseTasks, newTasks));
  }
};

/**
 * Moves a task to another quadrant, at `index` or to the end.
 * Resolves to the revert, or undefined if the task isn't there or already
 * in that quadrant.
 */
export const moveTaskAction = async (
  fromQuadrant: MatrixKey,
  taskId: string,
  toQuadrant: MatrixKey,
  index?: number,
): Promise<Revert | undefined> => {
  if (fromQuadrant === toQuadrant) return;

  const inCloud = isInCloud();
  let originalIndex: number | undefined;

  useTaskStore.setState((state) => {
    const tasks = selectTasks(state);
    const taskIndex = tasks[fromQuadrant].findIndex(
      (t: Task) => t.id === taskId,
    );
    if (taskIndex === -1) return;

    originalIndex = taskIndex;
    const [task] = tasks[fromQuadrant].splice(taskIndex, 1);
    if (typeof index === 'number') {
      tasks[toQuadrant].splice(index, 0, task);
    } else {
      tasks[toQuadrant].push(task);
    }
  });

  if (originalIndex === undefined) return;

  if (inCloud) {
    writeChanged([taskId], [fromQuadrant, toQuadrant]);
  }

  const indexToRestore = originalIndex;
  return async () => {
    await moveTaskAction(toQuadrant, taskId, fromQuadrant, indexToRestore);
  };
};

/** Resolves to the revert, or undefined if the task isn't there */
export const completeTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
  index?: number,
): Promise<Revert | undefined> => {
  const inCloud = isInCloud();
  let completed = false;
  let originalIndex: number | undefined;

  useTaskStore.setState((state) => {
    const tasks = selectTasks(state);
    const completedTasks = selectCompletedTasks(state);

    const taskIndex = tasks[quadrantKey].findIndex(
      (t: Task) => t.id === taskId,
    );
    if (taskIndex !== -1) {
      originalIndex = taskIndex;
      const task = tasks[quadrantKey][taskIndex];
      task.completed = true;
      task.completedAt = new Date();
      task.quadrantKey = quadrantKey; // Save original quadrant

      if (typeof index === 'number') {
        completedTasks.splice(index, 0, task);
      } else {
        completedTasks.push(task);
      }

      tasks[quadrantKey].splice(taskIndex, 1);
      completed = true;
    }
  });

  if (!completed) return;

  if (inCloud) {
    writeChanged([taskId], [quadrantKey, 'completed']);
  }

  const indexToRestore = originalIndex;
  return async () => {
    await restoreTaskAction(taskId, indexToRestore);
  };
};

/** Resolves to the revert, or undefined if the task isn't completed */
export const restoreTaskAction = async (
  taskId: string,
  index?: number,
): Promise<Revert | undefined> => {
  const inCloud = isInCloud();
  let restoredToQuadrant: MatrixKey | undefined;
  let originalIndexInCompleted: number | undefined;

  useTaskStore.setState((state) => {
    const tasks = selectTasks(state);
    const completedTasks = selectCompletedTasks(state);

    const taskIndex = completedTasks.findIndex((t: Task) => t.id === taskId);
    if (taskIndex !== -1) {
      originalIndexInCompleted = taskIndex;
      const task = { ...completedTasks[taskIndex] };
      const originalQuadrant = task.quadrantKey || RESTORE_FALLBACK_QUADRANT;

      task.completed = false;
      delete task.completedAt;
      delete task.quadrantKey;

      // Restore to original quadrant (or default) at specific index if provided
      if (typeof index === 'number') {
        tasks[originalQuadrant].splice(index, 0, task);
      } else {
        tasks[originalQuadrant].push(task);
      }

      completedTasks.splice(taskIndex, 1);
      restoredToQuadrant = originalQuadrant;
    }
  });

  if (!restoredToQuadrant) return;

  if (inCloud) {
    writeChanged([taskId], [restoredToQuadrant, 'completed']);
  }

  const quadrantKey = restoredToQuadrant;
  const indexToRestore = originalIndexInCompleted;
  return async () => {
    await completeTaskAction(quadrantKey, taskId, indexToRestore);
  };
};

const undoDeleteTaskAction = async (
  taskToRestore: Task,
  isCompleted: boolean,
  quadrantKey?: MatrixKey,
  index?: number,
) => {
  useTaskStore.setState((state) => {
    if (isCompleted) {
      const completedTasks = selectCompletedTasks(state);
      if (typeof index === 'number') {
        completedTasks.splice(index, 0, taskToRestore);
      } else {
        completedTasks.push(taskToRestore);
      }
    } else if (quadrantKey) {
      const tasks = selectTasks(state);
      if (typeof index === 'number') {
        tasks[quadrantKey].splice(index, 0, taskToRestore);
      } else {
        tasks[quadrantKey].push(taskToRestore);
      }
    }
  });

  if (isInCloud()) {
    const area = isCompleted ? 'completed' : quadrantKey;
    writeChanged([taskToRestore.id], area ? [area] : []);
  }
};

/** Resolves to the revert, or undefined if the task isn't there */
export const deleteTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
): Promise<Revert | undefined> => {
  const inCloud = isInCloud();
  let deletedTask: Task | undefined;
  let originalIndex: number | undefined;

  useTaskStore.setState((state) => {
    const tasks = selectTasks(state);
    const taskIndex = tasks[quadrantKey].findIndex(
      (t: Task) => t.id === taskId,
    );
    if (taskIndex !== -1) {
      originalIndex = taskIndex;
      deletedTask = { ...tasks[quadrantKey][taskIndex] };
      tasks[quadrantKey].splice(taskIndex, 1);
    }
  });

  if (!deletedTask) return;

  if (inCloud) {
    deleteFromCloud(taskId);
  }

  const taskToRestore = deletedTask;
  const indexToRestore = originalIndex;
  return () =>
    undoDeleteTaskAction(taskToRestore, false, quadrantKey, indexToRestore);
};

/** Resolves to the revert, or undefined if the task isn't there */
export const deleteCompletedTaskAction = async (
  taskId: string,
): Promise<Revert | undefined> => {
  const inCloud = isInCloud();
  let deletedTask: Task | undefined;
  let originalIndex: number | undefined;

  useTaskStore.setState((state) => {
    const completedTasks = selectCompletedTasks(state);
    const index = completedTasks.findIndex((t: Task) => t.id === taskId);
    if (index !== -1) {
      originalIndex = index;
      deletedTask = { ...completedTasks[index] };
      completedTasks.splice(index, 1);
    }
  });

  if (!deletedTask) return;

  if (inCloud) {
    deleteFromCloud(taskId);
  }

  const taskToRestore = deletedTask;
  const indexToRestore = originalIndex;
  return () =>
    undoDeleteTaskAction(taskToRestore, true, undefined, indexToRestore);
};

export const clearAllCompletedTasksAction = async () => {
  const inCloud = isInCloud();

  if (inCloud) {
    const { firebaseCompletedTasks } = useTaskStore.getState();
    writeToCloud(
      firebaseCompletedTasks.map(({ id }) => ({ type: 'delete', id })),
    );
  }

  useTaskStore.setState((state) => {
    if (inCloud) {
      state.firebaseCompletedTasks = [];
    } else {
      state.localCompletedTasks = [];
    }
  });
};
