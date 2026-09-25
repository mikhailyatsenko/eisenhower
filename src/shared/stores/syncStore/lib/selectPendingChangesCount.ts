import { SyncState } from '../types';
import { selectHasPendingChanges } from './selectHasPendingChanges';

/**
 * How many Pending changes there are: this session's unconfirmed writes, one
 * per action. Null when there are some but none from this session, so they
 * can't be counted; 0 when there are none.
 */
export const selectPendingChangesCount = (state: SyncState) => {
  if (!selectHasPendingChanges(state)) return 0;
  return state.unconfirmedWrites > 0 ? state.unconfirmedWrites : null;
};
