import { SyncState } from '../types';

/** No network, or the server hasn't answered for too long */
export const selectIsServerOutOfReach = ({ isOnline, isStalled }: SyncState) =>
  !isOnline || isStalled;
