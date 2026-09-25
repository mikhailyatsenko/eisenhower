import {
  SyncBarState,
  SyncErrorAction,
  SyncErrorCause,
  SyncState,
} from '../types';
import { selectHasPendingChanges } from './selectHasPendingChanges';
import { selectIsServerOutOfReach } from './selectIsServerOutOfReach';

const ERROR_ACTIONS: Record<SyncErrorCause, SyncErrorAction> = {
  refused: 'reload',
  sessionExpired: 'signIn',
};

/**
 * The bar for the new signals. A Sync error outranks the network. "Syncing…"
 * and "All changes saved" only ever follow offline, and only when there was
 * something to save: on a good network a change shows no bar at all.
 */
export const nextSyncBar = (state: SyncState): SyncBarState => {
  const { bar, isSignedIn, hasChangesToSave, syncError } = state;
  // An expired session shows its error with no one signed in
  if (syncError) return { kind: 'error', action: ERROR_ACTIONS[syncError] };
  if (!isSignedIn) return { kind: 'hidden' };
  if (selectIsServerOutOfReach(state)) return { kind: 'offline' };
  // Once the error is set right, the bar starts over
  if (bar.kind === 'error') return { kind: 'hidden' };
  if (bar.kind === 'offline' || bar.kind === 'syncing') {
    if (selectHasPendingChanges(state)) return { kind: 'syncing' };
    return hasChangesToSave ? { kind: 'saved' } : { kind: 'hidden' };
  }
  // A change while "All changes saved" is on doesn't bring "Syncing…" back
  return bar;
};
