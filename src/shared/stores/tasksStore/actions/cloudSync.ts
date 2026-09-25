import * as cloudMatrix from '@/shared/api/cloudMatrix';
import type { CloudSnapshot, TaskChange } from '@/shared/api/cloudMatrix';
import {
  resetSyncAction,
  selectIsServerOutOfReach,
  setAwaitingServerAction,
  setCloudPendingWritesAction,
  startSyncAction,
  trackCloudWriteAction,
  useSyncStore,
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
/** The device cache answered with no cloud Matrix: the server has it */
let isCacheEmpty = false;
let stopWatchingSync: (() => void) | null = null;

const hasTasks = ({ tasks, completedTasks }: CloudSnapshot) =>
  completedTasks.length > 0 ||
  Object.values(tasks).some((quadrant) => quadrant.length > 0);

const hasTask = (tasks: Tasks, taskId: string) =>
  Object.values(tasks).some((quadrant) =>
    quadrant.some(({ id }) => id === taskId),
  );

const setCloudLoaded = () =>
  useTaskStore.setState((state) => {
    state.isCloudLoaded = true;
  });

/**
 * With nothing cached and the server out of reach, the Matrix shows up
 * empty rather than behind a loader: the user can add tasks meanwhile.
 * A silent server counts only once the lie-fi clock runs out.
 */
const showWithoutServer = () => {
  const sync = useSyncStore.getState();
  if (useTaskStore.getState().isCloudLoaded || !sync.isAwaitingServer) return;
  if (sync.isStalled || (isCacheEmpty && selectIsServerOutOfReach(sync))) {
    setCloudLoaded();
  }
};

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

  // The server answered, or the device cache had the Matrix. Once the cache
  // came up empty, cached tasks are the ones added meanwhile: still waiting.
  const isKnown = !snapshot.fromCache || (!isCacheEmpty && hasTasks(snapshot));

  useTaskStore.setState((state) => {
    state.firebaseTasks = snapshot.tasks;
    state.firebaseCompletedTasks = snapshot.completedTasks;
    if (isKnown) state.isCloudLoaded = true;
  });
  if (isKnown) {
    setAwaitingServerAction(false);
  } else if (!useTaskStore.getState().isCloudLoaded) {
    // An empty cache may just not have the Matrix yet: wait for the server
    isCacheEmpty = true;
    showWithoutServer();
  }
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
  isCacheEmpty = false;
  startSyncAction();
  setAwaitingServerAction(true);
  stopWatchingSync = useSyncStore.subscribe(showWithoutServer);

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
      setCloudLoaded();
      setAwaitingServerAction(false);
    },
  );

  return () => {
    unsubscribe();
    uid = null;
    isHolding = false;
    heldSnapshot = null;
    isCacheEmpty = false;
    stopWatchingSync?.();
    stopWatchingSync = null;
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
