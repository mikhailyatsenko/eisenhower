import { create } from 'zustand';
import { SyncState } from '../types';

export const useSyncStore = create<SyncState>()(() => ({
  hasPendingWrites: false,
  unconfirmedWrites: 0,
}));
