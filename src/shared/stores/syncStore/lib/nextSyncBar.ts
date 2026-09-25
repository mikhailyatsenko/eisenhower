import { SyncBarState, SyncState } from '../types';
import { selectHasPendingChanges } from './selectHasPendingChanges';

/**
 * The bar for the new signals. "Syncing…" and "All changes saved" only ever
 * follow offline, and only when there was something to save: on a good
 * network a change shows no bar at all.
 */
export const nextSyncBar = (state: SyncState): SyncBarState => {
  const { bar, isSignedIn, isOnline, isStalled, hasChangesToSave } = state;
  if (!isSignedIn) return { kind: 'hidden' };
  if (!isOnline || isStalled) return { kind: 'offline' };
  if (bar.kind === 'offline' || bar.kind === 'syncing') {
    if (selectHasPendingChanges(state)) return { kind: 'syncing' };
    return hasChangesToSave ? { kind: 'saved' } : { kind: 'hidden' };
  }
  // A change while "All changes saved" is on doesn't bring "Syncing…" back
  return bar;
};
