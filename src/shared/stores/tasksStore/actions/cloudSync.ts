import * as cloudMatrix from '@/shared/api/cloudMatrix';
import type { CloudSnapshot, TaskChange } from '@/shared/api/cloudMatrix';
import {
  resetSyncAction,
  setCloudPendingWritesAction,
  startSyncAction,
  trackCloudWriteAction,
} from '@/shared/stores/syncStore';
import { selectTaskAction, useUIStore } from '@/shared/stores/uiStore';
import { useTaskStore } from '../hooks/useTasksStore';
import { getEmptyTasksState } from '../lib';
import { Tasks } from '../types';

// One live subscription to the signed-in user's cloud Matrix: every snapshot
// replaces the cloud tasks and Completed in the store

let uid: string | null = null;
let isHolding = false;
let heldSnapshot: CloudSnapshot | null = null;

const hasTasks = ({ tasks, completedTasks }: CloudSnapshot) =>
  completedTasks.length > 0 ||
  Object.values(tasks).some((quadrant) => quadrant.length > 0);

const hasTask = (tasks: Tasks, taskId: string) =>
  Object.values(tasks).some((quadrant) =>
    quadrant.some(({ id }) => id === taskId),
  );

const applySnapshot = (snapshot: CloudSnapshot) => {
  const { selectedTaskId } = useUIStore.getState();
  const { activeState, firebaseTasks } = useTaskStore.getState();
  // Still on screen, gone from the cloud: removed on another device or tab.
  // A task this device removed has left the store already.
  const isSelectionRemoved =
    activeState === 'firebase' &&
    selectedTaskId !== null &&
    hasTask(firebaseTasks, selectedTaskId) &&
    !hasTask(snapshot.tasks, selectedTaskId);

  useTaskStore.setState((state) => {
    state.firebaseTasks = snapshot.tasks;
    state.firebaseCompletedTasks = snapshot.completedTasks;
    // An empty cache may just not have the Matrix yet: wait for the server
    if (!snapshot.fromCache || hasTasks(snapshot)) state.isCloudLoaded = true;
  });
  if (isSelectionRemoved) selectTaskAction(null);
};

const resetCloudMatrix = () =>
  useTaskStore.setState((state) => {
    state.firebaseTasks = getEmptyTasksState();
    state.firebaseCompletedTasks = [];
    state.isCloudLoaded = false;
  });

/** Keeps the store in step with the user's cloud Matrix; returns the unsubscribe */
export const subscribeToCloudMatrix = (userId: string) => {
  uid = userId;
  resetCloudMatrix();
  startSyncAction();

  const unsubscribe = cloudMatrix.subscribe(
    userId,
    (snapshot) => {
      setCloudPendingWritesAction(snapshot.hasPendingWrites);
      if (isHolding) heldSnapshot = snapshot;
      else applySnapshot(snapshot);
    },
    (failure) => {
      console.error('Cloud matrix subscription failed:', failure);
      // Show what there is rather than a loader forever
      useTaskStore.setState((state) => {
        state.isCloudLoaded = true;
      });
    },
  );

  return () => {
    unsubscribe();
    uid = null;
    isHolding = false;
    heldSnapshot = null;
    resetCloudMatrix();
    resetSyncAction();
  };
};

/** While a drag is on, snapshots wait: they would undo its preview */
export const holdCloudSnapshotsAction = () => {
  isHolding = true;
};

/** Applies the last snapshot that came during the drag */
export const releaseCloudSnapshotsAction = () => {
  isHolding = false;
  const snapshot = heldSnapshot;
  heldSnapshot = null;
  if (snapshot) applySnapshot(snapshot);
};

/**
 * Sends the changes to the signed-in user's cloud Matrix without waiting for
 * the server: the device has them at once, the sync model tracks the rest.
 * Does nothing when no one is signed in.
 */
export const writeToCloud = (changes: TaskChange[]) => {
  if (!uid || changes.length === 0) return;
  trackCloudWriteAction(cloudMatrix.write(uid, changes));
};

export const isSignedInToCloud = () => uid !== null;
