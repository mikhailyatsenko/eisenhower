import { useSyncStore } from '../hooks/useSyncStore';
import { nextSyncBar, selectHasPendingChanges } from '../lib';
import { SyncState } from '../types';

/** Unconfirmed this long with the network up, Pending changes mean "lie-fi" */
const STALL_MS = 10_000;
/** How long "All changes saved" stays before the bar hides */
const SAVED_MS = 2_000;

let stallTimer: ReturnType<typeof setTimeout> | undefined;
let savedTimer: ReturnType<typeof setTimeout> | undefined;

const stopStallTimer = () => {
  clearTimeout(stallTimer);
  stallTimer = undefined;
};

const stopSavedTimer = () => {
  clearTimeout(savedTimer);
  savedTimer = undefined;
};

export const stopSyncTimers = () => {
  stopStallTimer();
  stopSavedTimer();
};

/**
 * Takes new signals and works out the bar from them. The lie-fi clock runs
 * while Pending changes wait with the network up, and starts over each time
 * the network comes back.
 */
export const applySyncSignals = (signals: Partial<SyncState>) => {
  const state = { ...useSyncStore.getState(), ...signals };
  const hasPendingChanges = selectHasPendingChanges(state);

  if (!hasPendingChanges || !state.isOnline) {
    stopStallTimer();
    state.isStalled = false;
  } else if (!state.isStalled && stallTimer === undefined) {
    stallTimer = setTimeout(() => {
      stallTimer = undefined;
      applySyncSignals({ isStalled: true });
    }, STALL_MS);
  }

  const bar = nextSyncBar(state);
  const isWaiting = bar.kind === 'offline' || bar.kind === 'syncing';
  const hasChangesToSave =
    isWaiting && (state.hasChangesToSave || hasPendingChanges);

  if (bar.kind !== 'saved') {
    stopSavedTimer();
  } else if (state.bar.kind !== 'saved') {
    savedTimer = setTimeout(() => {
      savedTimer = undefined;
      applySyncSignals({ bar: { kind: 'hidden' } });
    }, SAVED_MS);
  }

  useSyncStore.setState({ ...state, hasChangesToSave, bar });
};
