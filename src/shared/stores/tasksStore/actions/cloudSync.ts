import * as cloudMatrix from '@/shared/api/cloudMatrix';
import type {
  CloudSnapshot,
  TaskChange,
  Unsubscribe,
} from '@/shared/api/cloudMatrix';
import {
  clearSyncErrorAction,
  failSyncAction,
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
let stopListening: Unsubscribe | null = null;
let isHolding = false;
let heldSnapshot: CloudSnapshot | null = null;
/** The device cache answered with no cloud Matrix: the server has it */
let isCacheEmpty = false;
let stopWatchingSync: (() => void) | null = null;

type SnapshotListener = (snapshot: CloudSnapshot, isKnown: boolean) => void;
const snapshotListeners = new Set<SnapshotListener>();
const matrixChangeListeners = new Set<() => void>();

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

/**
 * The server answered, or the device cache had the Matrix. Once the cache
 * came up empty, cached tasks are the ones added meanwhile: still waiting.
 */
const isKnownSnapshot = (snapshot: CloudSnapshot) =>
  !snapshot.fromCache || (!isCacheEmpty && hasTasks(snapshot));

const applySnapshot = (snapshot: CloudSnapshot) => {
  const { selectedTaskId } = useUIStore.getState();
  const { isInCloud, firebaseTasks } = useTaskStore.getState();
  // Still on screen, gone from the cloud: removed on another device or tab.
  // A task this device removed has left the store already.
  const isSelectionRemoved =
    isInCloud &&
    selectedTaskId !== null &&
    hasTask(firebaseTasks, selectedTaskId) &&
    !hasTask(snapshot.tasks, selectedTaskId);

  const isKnown = isKnownSnapshot(snapshot);

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

/** The Matrix's Storage becomes the cloud while subscribed, the device after */
const resetCloudMatrix = (isInCloud: boolean) =>
  useTaskStore.setState((state) => {
    state.firebaseTasks = getEmptyTasksState();
    state.firebaseCompletedTasks = [];
    state.isCloudLoaded = false;
    state.isInCloud = isInCloud;
  });

/** Starts a live subscription; a reload's first server snapshot ends the Sync error */
const listen = (userId: string, isReload: boolean) => {
  let clearsErrorOnServerAnswer = isReload;
  stopListening = cloudMatrix.subscribe(
    userId,
    (snapshot) => {
      setCloudPendingWritesAction(snapshot.hasPendingWrites);
      if (clearsErrorOnServerAnswer && !snapshot.fromCache) {
        clearsErrorOnServerAnswer = false;
        clearSyncErrorAction();
      }
      if (isHolding) heldSnapshot = snapshot;
      else applySnapshot(snapshot);
      const isKnown = isKnownSnapshot(snapshot);
      snapshotListeners.forEach((listener) => listener(snapshot, isKnown));
    },
    () => {
      // Show what there is rather than a loader forever
      setCloudLoaded();
      setAwaitingServerAction(false);
      failSyncAction();
    },
  );
};

/** Keeps the store in step with the user's cloud Matrix; returns the unsubscribe */
export const subscribeToCloudMatrix = (userId: string) => {
  uid = userId;
  resetCloudMatrix(true);
  isCacheEmpty = false;
  startSyncAction();
  setAwaitingServerAction(true);
  stopWatchingSync = useSyncStore.subscribe(showWithoutServer);
  listen(userId, false);

  return () => {
    stopListening?.();
    stopListening = null;
    uid = null;
    isHolding = false;
    heldSnapshot = null;
    isCacheEmpty = false;
    stopWatchingSync?.();
    stopWatchingSync = null;
    resetCloudMatrix(false);
    resetSyncAction();
  };
};

/**
 * After a Sync error: subscribes anew, keeping the Matrix on screen. The
 * error goes with the first snapshot from the server.
 */
export const reloadCloudMatrixAction = () => {
  if (!uid) return;
  stopListening?.();
  listen(uid, true);
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
 * Hears every snapshot of the cloud Matrix, as it comes, with whether the
 * cloud is known by then: the server answered or the device cache had it
 */
export const listenToCloudSnapshots = (listener: SnapshotListener) => {
  snapshotListeners.add(listener);
  return () => {
    snapshotListeners.delete(listener);
  };
};

/** Hears the user change the cloud Matrix: add, edit, Complete, Delete, Move, Restore */
export const listenToMatrixChanges = (listener: () => void) => {
  matrixChangeListeners.add(listener);
  return () => {
    matrixChangeListeners.delete(listener);
  };
};

/** Tracks the write in the sync model; resolves or rejects with the server */
const trackWrite = (userId: string, changes: TaskChange[]) => {
  const write = cloudMatrix.write(userId, changes);
  trackCloudWriteAction(write);
  return write;
};

/**
 * Sends the user's changes to the signed-in user's cloud Matrix without
 * waiting for the server: the device has them at once, the sync model tracks
 * the rest. Does nothing when no one is signed in.
 */
export const writeToCloud = (changes: TaskChange[]) => {
  if (!uid || changes.length === 0) return;
  trackWrite(uid, changes);
  matrixChangeListeners.forEach((listener) => listener());
};

/** One write that is no change of the user's; rejects if the server refuses it */
const writeForMigration = async (changes: TaskChange[]) => {
  if (!uid || changes.length === 0) return;
  await trackWrite(uid, changes);
};

/** Writes the device's tasks to the cloud Matrix as one write */
export const moveToCloudAction = (changes: TaskChange[]) =>
  writeForMigration(changes);

/** Takes these tasks out of the cloud Matrix as one write: Undo of the move */
export const removeFromCloudAction = (taskIds: string[]) =>
  writeForMigration(taskIds.map((id) => ({ type: 'delete', id })));
