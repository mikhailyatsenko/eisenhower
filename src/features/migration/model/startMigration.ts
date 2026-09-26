import type { CloudSnapshot, SyncFailure } from '@/shared/api/cloudMatrix';
import { waitForPendingWrites } from '@/shared/api/cloudMatrix';
import {
  listenToCloudSnapshots,
  listenToMatrixChanges,
  moveToCloudAction,
  removeFromDeviceAction,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import { dismissToast, showToast } from '@/shared/ui/toast';
import { migrationPlan } from '../lib';

const movedMessage = (count: number) =>
  `${count} ${count === 1 ? 'task' : 'tasks'} moved to your account`;

const snapshotIds = ({ tasks, completedTasks }: CloudSnapshot) =>
  [...Object.values(tasks).flat(), ...completedTasks].map(({ id }) => id);

/**
 * Moves the device's Matrix into the signed-in user's cloud once the cloud
 * is known. Into an empty cloud it goes at once, with a toast that stays
 * until the user changes the Matrix. The device lets go of a task only once
 * the server has it, so a lost network, a closed tab or a refusal loses
 * nothing: the next start finds the tasks in the cloud and just clears them.
 * Returns the stop, for sign-out and page close.
 */
export const startMigration = () => {
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

  const showMoved = (count: number, write: Promise<void>) => {
    const toastId = showToast({
      message: movedMessage(count),
      isPersistent: true,
    });
    stopWatchingMatrix = listenToMatrixChanges(() => {
      dismissToast(toastId);
      stopWatchingMatrix?.();
      stopWatchingMatrix = null;
    });
    // The tasks didn't move: the Sync error says so
    write.catch((failure: SyncFailure) => {
      if (failure.isRejected) dismissToast(toastId);
    });
  };

  const decide = (cloud: CloudSnapshot) => {
    const { localTasks, localCompletedTasks } = useTaskStore.getState();
    const plan = migrationPlan(
      { tasks: localTasks, completedTasks: localCompletedTasks },
      cloud,
    );
    // Asking whether to add to a cloud with its own tasks comes later
    if (plan.decision === 'ask') return;
    if (plan.decision === 'move') {
      showMoved(plan.count, moveToCloudAction(plan.changes));
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
    stopWatchingMatrix?.();
  };
};
