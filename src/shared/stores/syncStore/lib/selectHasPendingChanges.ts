import { SyncState } from '../types';

/** Some changes haven't reached the server yet */
export const selectHasPendingChanges = ({
  hasPendingWrites,
  unconfirmedWrites,
}: SyncState) => hasPendingWrites || unconfirmedWrites > 0;
