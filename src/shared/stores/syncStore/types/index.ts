export interface SyncState {
  /** The last cloud snapshot holds changes the server hasn't confirmed, from any session */
  hasPendingWrites: boolean;
  /** Writes of this session the server hasn't confirmed or refused yet */
  unconfirmedWrites: number;
}
