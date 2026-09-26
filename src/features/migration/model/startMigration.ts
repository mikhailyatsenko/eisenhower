import type { CloudSnapshot, SyncFailure } from '@/shared/api/cloudMatrix';
import { waitForPendingWrites } from '@/shared/api/cloudMatrix';
import {
  listenToCloudSnapshots,
  listenToMatrixChanges,
  moveToCloudAction,
  removeFromCloudAction,
  removeFromDeviceAction,
  restoreDeviceAction,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import { dismissToast, showToast } from '@/shared/ui/toast';
import { migrationPlan } from '../lib';
import type { MatrixTasks } from '../types';
import { isMigrationRefused, refuseMigration } from './refusal';

const movedMessage = (count: number) =>
  `${count} ${count === 1 ? 'task' : 'tasks'} moved to your account`;

const snapshotIds = ({ tasks, completedTasks }: CloudSnapshot) =>
  [...Object.values(tasks).flat(), ...completedTasks].map(({ id }) => id);

const matrixIds = ({ tasks, completedTasks }: MatrixTasks) =>
  [...Object.values(tasks).flat(), ...completedTasks].map(({ id }) => id);

/**
 * Moves the device's Matrix into the signed-in user's cloud once the cloud
 * is known. Into an empty cloud it goes at once, with a toast that stays
 * until the user changes the Matrix. The device lets go of a task only once
 * the server has it, so a lost network, a closed tab or a refusal loses
 * nothing: the next start finds the tasks in the cloud and just clears them.
 * Undo takes them out of the cloud, back to the device, and no move is
 * offered again while the user stays signed in. Returns the stop, for
 * sign-out and page close.
 */
export const startMigration = (uid: string) => {
  let isStopped = false;
  let isDecided = false;
  let lastSnapshot: CloudSnapshot | null = null;
  let checkServerSnapshot: (() => void) | null = null;
  let stopWatchingMatrix: (() => void) | null = null;

  /** The latest snapshot once it is the server's, with nothing pending */
  const serverSnapshot = () =>
    new Promise<CloudSnapshot>((resolve) => {
      checkServerSnapshot = () => {
        const snapshot = lastSnapshot;
        if (!snapshot || snapshot.fromCache || snapshot.hasPendingWrites) {
          return;
        }
        checkServerSnapshot = null;
        resolve(snapshot);
      };
      checkServerSnapshot();
    });

  const clearDevice = async () => {
    await waitForPendingWrites();
    if (isStopped) return;
    // A refused write has left the snapshot: its tasks stay on the device
    const confirmed = await serverSnapshot();
    if (isStopped) return;
    removeFromDeviceAction(snapshotIds(confirmed));
  };

  const stopWatching = () => {
    stopWatchingMatrix?.();
    stopWatchingMatrix = null;
  };

  /**
   * The account without the device's tasks, those a move cut short had left
   * there too, and the device as before the move
   */
  const undo = (device: MatrixTasks) => {
    isStopped = true;
    stopWatching();
    refuseMigration(uid);
    restoreDeviceAction(device);
    // A refused write is the Sync error's to tell
    removeFromCloudAction(matrixIds(device)).catch(() => {});
  };

  const showMoved = (
    device: MatrixTasks,
    count: number,
    write: Promise<void>,
  ) => {
    const toastId = showToast({
      message: movedMessage(count),
      isPersistent: true,
      action: {
        label: 'Undo',
        shortcutKey: 'z',
        onClick: () => {
          // No toast for the Undo itself
          dismissToast(toastId);
          undo(device);
        },
      },
    });
    stopWatchingMatrix = listenToMatrixChanges(() => {
      dismissToast(toastId);
      stopWatching();
    });
    // The tasks didn't move: the Sync error says so
    write.catch((failure: SyncFailure) => {
      if (failure.isRejected) dismissToast(toastId);
    });
  };

  const decide = (cloud: CloudSnapshot) => {
    if (isMigrationRefused(uid)) return;
    const { localTasks, localCompletedTasks } = useTaskStore.getState();
    const device = { tasks: localTasks, completedTasks: localCompletedTasks };
    const plan = migrationPlan(device, cloud);
    // Asking whether to add to a cloud with its own tasks comes later
    if (plan.decision === 'ask') return;
    if (plan.decision === 'move') {
      showMoved(device, plan.count, moveToCloudAction(plan.changes));
    }
    // Firestore rejects the wait when the user changes: the tasks stay, the
    // next start clears them
    clearDevice().catch(() => {});
  };

  const stopListening = listenToCloudSnapshots((snapshot, isKnown) => {
    lastSnapshot = snapshot;
    checkServerSnapshot?.();
    if (isDecided || !isKnown) return;
    isDecided = true;
    decide(snapshot);
  });

  return () => {
    isStopped = true;
    stopListening();
    stopWatching();
  };
};
