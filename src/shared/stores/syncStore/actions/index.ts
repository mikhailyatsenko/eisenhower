import { useSyncStore } from '../hooks/useSyncStore';

// Writes made before the last reset settle into a fresh count: they don't count
let resets = 0;

const countUnconfirmed = (delta: number) =>
  useSyncStore.setState(({ unconfirmedWrites }) => ({
    unconfirmedWrites: unconfirmedWrites + delta,
  }));

/**
 * Counts the write as unconfirmed until the server confirms or refuses it.
 * A refusal is only logged for now.
 */
export const trackCloudWriteAction = (write: Promise<void>) => {
  const resetsAtWrite = resets;
  countUnconfirmed(1);
  write
    .catch((error) => console.error('Cloud write failed:', error))
    .finally(() => {
      if (resetsAtWrite === resets) countUnconfirmed(-1);
    });
};

export const setCloudPendingWritesAction = (hasPendingWrites: boolean) =>
  useSyncStore.setState({ hasPendingWrites });

/** Forgets the cloud Matrix: on sign-out or when the page closes */
export const resetSyncAction = () => {
  resets += 1;
  useSyncStore.setState(useSyncStore.getInitialState(), true);
};
