import { create } from 'zustand';
import { SyncState } from '../types';

export const useSyncStore = create<SyncState>()(() => ({
  hasPendingWrites: false,
  unconfirmedWrites: 0,
  isSignedIn: false,
  isOnline: true,
  isStalled: false,
  hasChangesToSave: false,
  bar: { kind: 'hidden' },
}));
