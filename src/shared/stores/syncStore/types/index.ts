/** Why the cloud Matrix is out of step: a Sync error */
export type SyncErrorCause =
  /** The server refused a change, or dropped the subscription */
  | 'refused'
  /** The session expired without Sign out while changes waited for the cloud */
  | 'sessionExpired';

/** What the sync error bar offers to set things right */
export type SyncErrorAction = 'reload' | 'signIn';

/** What the sync bar under the top row of buttons shows */
export type SyncBarState =
  | { kind: 'hidden' }
  /** The cloud refused changes, dropped the subscription, or the session expired: a Sync error */
  | { kind: 'error'; action: SyncErrorAction }
  /** No network, or Pending changes unconfirmed for too long ("lie-fi") */
  | { kind: 'offline' }
  /** Was offline, the network is back, Pending changes are still going out */
  | { kind: 'syncing' }
  /** Pending changes from the offline spell are confirmed; hides shortly */
  | { kind: 'saved' };

export interface SyncState {
  /** The last cloud snapshot holds changes the server hasn't confirmed, from any session */
  hasPendingWrites: boolean;
  /** Writes of this session the server hasn't confirmed or refused yet */
  unconfirmedWrites: number;
  /** A user is signed in and the cloud Matrix is subscribed to */
  isSignedIn: boolean;
  /** `navigator.onLine` */
  isOnline: boolean;
  /** Pending changes, or an empty device cache, have waited for the server too long with the network up */
  isStalled: boolean;
  /** The device cache had no cloud Matrix, and the server hasn't answered yet */
  isAwaitingServer: boolean;
  /** A Sync error happened; it stays until the user sets it right */
  syncError: SyncErrorCause | null;
  /** There were Pending changes while the bar said offline or "Syncing…" */
  hasChangesToSave: boolean;
  bar: SyncBarState;
}
