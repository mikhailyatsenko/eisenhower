import { v4 as uuidv4 } from 'uuid';

import {
  showToastNotificationByAddTask,
  showToastNotificationByCompleteTask,
  showToastNotificationByDeleteTask,
  showToastNotificationByEditTask,
  showErrorToast,
} from '@/shared/lib/toastNotifications';
import { useTaskStore } from '../hooks/useTasksStore';
import {
  fetchTasksFromFirebase,
  syncTasksToFirebase,
  deleteTaskFromFirebase,
  clearCompletedTasksFromFirebase,
} from '../lib';
import { MatrixKey, Task, Tasks } from '../types';

export const syncTasks = async () => {
  const result = await fetchTasksFromFirebase();
  if (!result) return;
  useTaskStore.setState((state) => {
    state.firebaseTasks = result.tasks;
    state.firebaseCompletedTasks = result.completedTasks;
  });
};

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
    const state = useTaskStore.getState();
    await syncTasksToFirebase(
      state.firebaseTasks,
      state.firebaseCompletedTasks,
    );
  }
  return taskId;
};

export const editTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
  newText: string,
  newDueDate?: Date | null,
  newQuadrantKey?: MatrixKey,
  skipToast: boolean = false,
) => {
  let isChanged = false;
  let oldText = '';
  let oldDueDate: Date | undefined;
  const oldQuadrant: MatrixKey = quadrantKey;
  const finalQuadrant: MatrixKey = newQuadrantKey || quadrantKey;

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
        oldText = task.text;
        oldDueDate = task.dueDate;

        task.text = newText;
        task.dueDate =
          newDueDate === null ? undefined : newDueDate || task.dueDate;

        if (quadrantChanged && newQuadrantKey) {
          const [movedTask] = tasks[quadrantKey].splice(taskIndex, 1);
          movedTask.quadrantKey = newQuadrantKey;
          tasks[newQuadrantKey].push(movedTask);
        }

        isChanged = true;
      }
    }
  });

  if (isChanged) {
    if (!skipToast) {
      showToastNotificationByEditTask(() =>
        editTaskAction(
          finalQuadrant,
          taskId,
          oldText,
          oldDueDate,
          oldQuadrant,
          true,
        ),
      );
    }

    if (useTaskStore.getState().activeState === 'firebase') {
      const state = useTaskStore.getState();
      await syncTasksToFirebase(
        state.firebaseTasks,
        state.firebaseCompletedTasks,
      );
    }
  }
};

export const dragOverQuadrantAction = (
  taskId: string,
  fromQuadrant: MatrixKey,
  toQuadrant: MatrixKey,
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
      overItems.push(movedTask);
    }
  });
};

export const dragEndAction = async (newTasks: Tasks) => {
  const { activeState } = useTaskStore.getState();
  useTaskStore.setState((state) => {
    if (activeState === 'local') {
      state.localTasks = newTasks;
    } else {
      state.firebaseTasks = newTasks;
    }
  });

  if (activeState === 'firebase') {
    const state = useTaskStore.getState();
    await syncTasksToFirebase(newTasks, state.firebaseCompletedTasks);
  }
};

export const completeTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
  skipToast: boolean = false,
  index?: number,
) => {
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

  if (completed) {
    if (!skipToast) {
      const indexToRestore = originalIndex;
      showToastNotificationByCompleteTask(() =>
        restoreTaskAction(taskId, true, indexToRestore),
      );
    }

    if (activeState === 'firebase') {
      const state = useTaskStore.getState();
      await syncTasksToFirebase(
        state.firebaseTasks,
        state.firebaseCompletedTasks,
      );
    }
  }
};

export const restoreTaskAction = async (
  taskId: string,
  skipToast: boolean = false,
  index?: number,
) => {
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
      // Default to NotImportantNotUrgent (Eliminate) if no quadrantKey
      const originalQuadrant = task.quadrantKey || 'NotImportantNotUrgent';

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

  if (restoredToQuadrant && !skipToast) {
    const indexToRestore = originalIndexInCompleted;
    showToastNotificationByAddTask(restoredToQuadrant, true, () =>
      completeTaskAction(restoredToQuadrant!, taskId, true, indexToRestore),
    );
  }

  if (activeState === 'firebase') {
    const state = useTaskStore.getState();
    await syncTasksToFirebase(
      state.firebaseTasks,
      state.firebaseCompletedTasks,
    );
  }
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
    const state = useTaskStore.getState();
    await syncTasksToFirebase(
      state.firebaseTasks,
      state.firebaseCompletedTasks,
    );
  }
};

export const deleteTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
  skipToast: boolean = false,
) => {
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

  if (deletedTask) {
    if (!skipToast) {
      const taskToRestore = deletedTask;
      const indexToRestore = originalIndex;
      showToastNotificationByDeleteTask(() =>
        undoDeleteTaskAction(taskToRestore, false, quadrantKey, indexToRestore),
      );
    }

    if (activeState === 'firebase') {
      await deleteTaskFromFirebase(taskId);
    }
  }
};

export const deleteCompletedTaskAction = async (
  taskId: string,
  skipToast: boolean = false,
) => {
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

  if (deletedTask) {
    if (!skipToast) {
      const taskToRestore = deletedTask;
      const indexToRestore = originalIndex;
      showToastNotificationByDeleteTask(() =>
        undoDeleteTaskAction(taskToRestore, true, undefined, indexToRestore),
      );
    }

    if (activeState === 'firebase') {
      await deleteTaskFromFirebase(taskId);
    }
  }
};

export const clearAllCompletedTasksAction = async () => {
  const { activeState } = useTaskStore.getState();

  try {
    if (activeState === 'firebase') {
      await clearCompletedTasksFromFirebase();
    }

    useTaskStore.setState((state) => {
      if (activeState === 'local') {
        state.localCompletedTasks = [];
      } else {
        state.firebaseCompletedTasks = [];
      }
    });
  } catch (error) {
    showErrorToast('Failed to clear completed tasks. Please try again.');
    throw error;
  }
};

export const copyLocalTasksToFirebaseAction = async () => {
  const { localTasks, localCompletedTasks } = useTaskStore.getState();

  useTaskStore.setState((state) => {
    // Copy active tasks
    (Object.keys(localTasks) as MatrixKey[]).forEach((quadrant) => {
      const newTasks = localTasks[quadrant].map((task) => ({
        ...task,
        id: uuidv4(),
        createdAt: new Date(task.createdAt),
      }));
      state.firebaseTasks[quadrant].push(...newTasks);
    });

    // Copy completed tasks
    const newCompletedTasks = localCompletedTasks.map((task) => ({
      ...task,
      id: uuidv4(),
      createdAt: new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }));
    state.firebaseCompletedTasks.push(...newCompletedTasks);
  });

  const updatedState = useTaskStore.getState();
  await syncTasksToFirebase(
    updatedState.firebaseTasks,
    updatedState.firebaseCompletedTasks,
  );
};
