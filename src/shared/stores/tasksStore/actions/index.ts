import { v4 as uuidv4 } from 'uuid';

import { useTaskStore } from '../hooks/useTasksStore';
import {
  fetchTasksFromFirebase,
  syncTasksToFirebase,
  deleteTaskFromFirebase,
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
) => {
  if (taskInputText.length > 200) return;
  const newTask: Task = {
    id: uuidv4(),
    text: taskInputText,
    createdAt: new Date(),
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
};

export const editTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
  newText: string,
) => {
  useTaskStore.setState((state) => {
    const tasks =
      state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
    const task = tasks[quadrantKey].find((t) => t.id === taskId);
    if (task) task.text = newText;
  });
  if (useTaskStore.getState().activeState === 'firebase') {
    const state = useTaskStore.getState();
    await syncTasksToFirebase(
      state.firebaseTasks,
      state.firebaseCompletedTasks,
    );
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
) => {
  const { activeState } = useTaskStore.getState();
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
      const task = tasks[quadrantKey][taskIndex];
      task.completed = true;
      task.completedAt = new Date();
      task.quadrantKey = quadrantKey; // Save original quadrant
      completedTasks.push(task);
      tasks[quadrantKey].splice(taskIndex, 1);
    }
  });

  if (activeState === 'firebase') {
    const state = useTaskStore.getState();
    await syncTasksToFirebase(
      state.firebaseTasks,
      state.firebaseCompletedTasks,
    );
  }
};

export const restoreTaskAction = async (taskId: string) => {
  const { activeState } = useTaskStore.getState();
  useTaskStore.setState((state) => {
    const tasks =
      activeState === 'local' ? state.localTasks : state.firebaseTasks;
    const completedTasks =
      activeState === 'local'
        ? state.localCompletedTasks
        : state.firebaseCompletedTasks;

    const taskIndex = completedTasks.findIndex((t: Task) => t.id === taskId);
    if (taskIndex !== -1) {
      const task = { ...completedTasks[taskIndex] };
      // Default to NotImportantNotUrgent (Eliminate) if no quadrantKey
      const originalQuadrant = task.quadrantKey || 'NotImportantNotUrgent';

      task.completed = false;
      delete task.completedAt;
      delete task.quadrantKey;

      // Restore to original quadrant (or default)
      tasks[originalQuadrant].push(task);
      completedTasks.splice(taskIndex, 1);
    }
  });

  if (activeState === 'firebase') {
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
) => {
  const { activeState } = useTaskStore.getState();
  useTaskStore.setState((state) => {
    const tasks =
      activeState === 'local' ? state.localTasks : state.firebaseTasks;
    tasks[quadrantKey] = tasks[quadrantKey].filter(
      (t: Task) => t.id !== taskId,
    );
  });
  if (activeState === 'firebase') {
    await deleteTaskFromFirebase(taskId);
  }
};

export const deleteCompletedTaskAction = async (taskId: string) => {
  const { activeState } = useTaskStore.getState();
  useTaskStore.setState((state) => {
    const completedTasks =
      activeState === 'local'
        ? state.localCompletedTasks
        : state.firebaseCompletedTasks;
    const index = completedTasks.findIndex((t: Task) => t.id === taskId);
    if (index !== -1) {
      completedTasks.splice(index, 1);
    }
  });

  if (activeState === 'firebase') {
    await deleteTaskFromFirebase(taskId);
  }
};
