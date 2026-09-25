import type { SyncFailure } from '@/shared/api/cloudMatrix';
import { useSyncStore } from '../hooks/useSyncStore';
import { applySyncSignals, stopSyncTimers } from './applySyncSignals';

// Writes made before the last reset settle into a fresh count: they don't count
let resets = 0;
let stopWatchingNetwork: (() => void) | null = null;

const countUnconfirmed = (delta: number) =>
  applySyncSignals({
    unconfirmedWrites: useSyncStore.getState().unconfirmedWrites + delta,
  });

/** The cloud refused changes or dropped the subscription: the bar offers a reload */
export const failSyncAction = () => applySyncSignals({ syncError: 'refused' });

/** The Matrix came from the server again after a Sync error */
export const clearSyncErrorAction = () => applySyncSignals({ syncError: null });

/**
 * Counts the write as unconfirmed until the server confirms or refuses it.
 * A refusal is a Sync error; the snapshot has taken the change back already.
 */
export const trackCloudWriteAction = (write: Promise<void>) => {
  const resetsAtWrite = resets;
  countUnconfirmed(1);
  write
    .catch((failure: SyncFailure) => {
      if (resetsAtWrite !== resets) return;
      // Not a refusal: the change may still get through
      if (failure.isRejected) failSyncAction();
      else console.error('Cloud write failed:', failure);
    })
    .finally(() => {
      if (resetsAtWrite === resets) countUnconfirmed(-1);
    });
};

export const setCloudPendingWritesAction = (hasPendingWrites: boolean) =>
  applySyncSignals({ hasPendingWrites });

/** Whether the Matrix waits for the server with nothing from the device cache */
export const setAwaitingServerAction = (isAwaitingServer: boolean) =>
  applySyncSignals({ isAwaitingServer });

/** A user is signed in to the cloud Matrix: the bar follows the network */
export const startSyncAction = () => {
  stopWatchingNetwork?.();
  const onNetworkChange = () =>
    applySyncSignals({ isOnline: navigator.onLine });
  window.addEventListener('online', onNetworkChange);
  window.addEventListener('offline', onNetworkChange);
  stopWatchingNetwork = () => {
    window.removeEventListener('online', onNetworkChange);
    window.removeEventListener('offline', onNetworkChange);
  };
  applySyncSignals({ isSignedIn: true, isOnline: navigator.onLine });
};

/** Forgets the cloud Matrix: on sign-out or when the page closes */
export const resetSyncAction = () => {
  resets += 1;
  stopWatchingNetwork?.();
  stopWatchingNetwork = null;
  stopSyncTimers();
  useSyncStore.setState(useSyncStore.getInitialState(), true);
};
