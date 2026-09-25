import { v4 as uuidv4 } from 'uuid';

import { MATRIX_KEYS } from '@/shared/consts';
import { RESTORE_FALLBACK_QUADRANT } from '../consts';
import { useTaskStore } from '../hooks/useTasksStore';
import { actionChanges, reorderedQuadrants } from '../lib';
import { MatrixKey, Revert, Task, TaskArea, Tasks } from '../types';
import { isSignedInToCloud, writeToCloud } from './cloudSync';

export {
  subscribeToCloudMatrix,
  reloadCloudMatrixAction,
  holdCloudSnapshotsAction,
  releaseCloudSnapshotsAction,
} from './cloudSync';

// Actions change the store at once and don't wait for the cloud: the write
// goes to the sync model, the device has it already

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

export const switchToLocalTasks = () => {
  useTaskStore.setState((state) => {
    state.activeState = 'local';
  });
};

export const switchToFirebaseTasks = () => {
  useTaskStore.setState((state) => {
    state.activeState = 'firebase';
  });
};

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
    const tasks =
      state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
    tasks[quadrantKey].push(newTask);
  });
  if (useTaskStore.getState().activeState === 'firebase') {
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
    const tasks =
      state.activeState === 'local' ? state.localTasks : state.firebaseTasks;

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
    if (useTaskStore.getState().activeState === 'firebase') {
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
    const tasks =
      state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
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
  const { activeState, firebaseTasks } = useTaskStore.getState();
  useTaskStore.setState((state) => {
    if (activeState === 'local') {
      state.localTasks = newTasks;
    } else {
      state.firebaseTasks = newTasks;
    }
  });

  if (activeState === 'firebase') {
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

  const { activeState } = useTaskStore.getState();
  let originalIndex: number | undefined;

  useTaskStore.setState((state) => {
    const tasks =
      activeState === 'local' ? state.localTasks : state.firebaseTasks;
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

  if (activeState === 'firebase') {
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
  const { activeState } = useTaskStore.getState();
  let completed = false;
  let originalIndex: number | undefined;

  useTaskStore.setState((state) => {
    const tasks =
      activeState === 'local' ? state.localTasks : state.firebaseTasks;
    const completedTasks =
      activeState === 'local'
        ? state.localCompletedTasks
        : state.firebaseCompletedTasks;

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

  if (activeState === 'firebase') {
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
  const { activeState } = useTaskStore.getState();
  let restoredToQuadrant: MatrixKey | undefined;
  let originalIndexInCompleted: number | undefined;

  useTaskStore.setState((state) => {
    const tasks =
      activeState === 'local' ? state.localTasks : state.firebaseTasks;
    const completedTasks =
      activeState === 'local'
        ? state.localCompletedTasks
        : state.firebaseCompletedTasks;

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

  if (activeState === 'firebase') {
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
    const isLocal = state.activeState === 'local';
    if (isCompleted) {
      const completedTasks = isLocal
        ? state.localCompletedTasks
        : state.firebaseCompletedTasks;
      if (typeof index === 'number') {
        completedTasks.splice(index, 0, taskToRestore);
      } else {
        completedTasks.push(taskToRestore);
      }
    } else if (quadrantKey) {
      const tasks = isLocal ? state.localTasks : state.firebaseTasks;
      if (typeof index === 'number') {
        tasks[quadrantKey].splice(index, 0, taskToRestore);
      } else {
        tasks[quadrantKey].push(taskToRestore);
      }
    }
  });

  if (useTaskStore.getState().activeState === 'firebase') {
    const area = isCompleted ? 'completed' : quadrantKey;
    writeChanged([taskToRestore.id], area ? [area] : []);
  }
};

/** Resolves to the revert, or undefined if the task isn't there */
export const deleteTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
): Promise<Revert | undefined> => {
  const { activeState } = useTaskStore.getState();
  let deletedTask: Task | undefined;
  let originalIndex: number | undefined;

  useTaskStore.setState((state) => {
    const tasks =
      activeState === 'local' ? state.localTasks : state.firebaseTasks;
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

  if (activeState === 'firebase') {
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
  const { activeState } = useTaskStore.getState();
  let deletedTask: Task | undefined;
  let originalIndex: number | undefined;

  useTaskStore.setState((state) => {
    const completedTasks =
      activeState === 'local'
        ? state.localCompletedTasks
        : state.firebaseCompletedTasks;
    const index = completedTasks.findIndex((t: Task) => t.id === taskId);
    if (index !== -1) {
      originalIndex = index;
      deletedTask = { ...completedTasks[index] };
      completedTasks.splice(index, 1);
    }
  });

  if (!deletedTask) return;

  if (activeState === 'firebase') {
    deleteFromCloud(taskId);
  }

  const taskToRestore = deletedTask;
  const indexToRestore = originalIndex;
  return () =>
    undoDeleteTaskAction(taskToRestore, true, undefined, indexToRestore);
};

/** Throws if no one is signed in to the cloud Matrix; the completed tasks then stay */
export const clearAllCompletedTasksAction = async () => {
  const { activeState } = useTaskStore.getState();

  if (activeState === 'firebase') {
    if (!isSignedInToCloud()) {
      throw new Error('User must be authenticated to clear tasks');
    }
    const { firebaseCompletedTasks } = useTaskStore.getState();
    writeToCloud(
      firebaseCompletedTasks.map(({ id }) => ({ type: 'delete', id })),
    );
  }

  useTaskStore.setState((state) => {
    if (activeState === 'local') {
      state.localCompletedTasks = [];
    } else {
      state.firebaseCompletedTasks = [];
    }
  });
};

export const copyLocalTasksToFirebaseAction = async () => {
  const { localTasks, localCompletedTasks } = useTaskStore.getState();
  const copiedIds: string[] = [];

  useTaskStore.setState((state) => {
    // Copy active tasks
    (Object.keys(localTasks) as MatrixKey[]).forEach((quadrant) => {
      const newTasks = localTasks[quadrant].map((task) => ({
        ...task,
        id: uuidv4(),
        createdAt: new Date(task.createdAt),
      }));
      copiedIds.push(...newTasks.map(({ id }) => id));
      state.firebaseTasks[quadrant].push(...newTasks);
    });

    // Copy completed tasks
    const newCompletedTasks = localCompletedTasks.map((task) => ({
      ...task,
      id: uuidv4(),
      createdAt: new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }));
    copiedIds.push(...newCompletedTasks.map(({ id }) => id));
    state.firebaseCompletedTasks.push(...newCompletedTasks);
  });

  writeChanged(copiedIds, [...MATRIX_KEYS, 'completed']);
};
