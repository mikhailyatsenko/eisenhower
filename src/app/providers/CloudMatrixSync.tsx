'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/shared/api/auth';
import {
  cancelDeviceClear,
  clearDeviceIfRequested,
  isDeviceClearRequested,
} from '@/shared/api/cloudMatrix';
import {
  failExpiredSessionAction,
  selectHasPendingChanges,
  useSyncStore,
} from '@/shared/stores/syncStore';
import { subscribeToCloudMatrix } from '@/shared/stores/tasksStore';

/**
 * Holds the one live subscription to the signed-in user's cloud Matrix for
 * the whole app: the matrix, Completed and the header all read it. Once the
 * user has signed out, here or in another tab, it clears the device. A
 * session that expired with Pending changes keeps them on the device for the
 * same user to sign in again.
 */
export const CloudMatrixSync = () => {
  const { user, isLoading } = useAuth();
  const uid = user?.uid;
  const isSignedOut = !isLoading && !uid;
  const hadPendingChanges = useRef(false);

  useEffect(() => {
    if (!uid) return;
    cancelDeviceClear();
    const unsubscribe = subscribeToCloudMatrix(uid);
    return () => {
      // Read before the unsubscribe resets the sync model
      hadPendingChanges.current = selectHasPendingChanges(
        useSyncStore.getState(),
      );
      unsubscribe();
    };
  }, [uid]);

  // Runs after the unsubscribe above. No clear request: the user didn't sign out
  useEffect(() => {
    if (!isSignedOut) return;
    if (isDeviceClearRequested()) void clearDeviceIfRequested();
    else if (hadPendingChanges.current) failExpiredSessionAction();
  }, [isSignedOut]);

  return null;
};
