import { create } from 'zustand';
import { SyncState } from '../types';

export const useSyncStore = create<SyncState>()(() => ({
  hasPendingWrites: false,
  unconfirmedWrites: 0,
  isSignedIn: false,
  isOnline: true,
  isStalled: false,
  isAwaitingServer: false,
  syncError: null,
  hasChangesToSave: false,
  bar: { kind: 'hidden' },
}));
