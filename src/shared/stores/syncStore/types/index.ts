/** What the sync bar under the top row of buttons shows */
export type SyncBarState =
  | { kind: 'hidden' }
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
  /** Pending changes have waited for the server too long with the network up */
  isStalled: boolean;
  /** There were Pending changes while the bar said offline or "Syncing…" */
  hasChangesToSave: boolean;
  bar: SyncBarState;
}
