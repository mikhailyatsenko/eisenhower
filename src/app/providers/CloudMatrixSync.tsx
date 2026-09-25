'use client';

import { useEffect } from 'react';
import { useAuth } from '@/shared/api/auth';
import {
  cancelDeviceClear,
  clearDeviceIfRequested,
} from '@/shared/api/cloudMatrix';
import { subscribeToCloudMatrix } from '@/shared/stores/tasksStore';

/**
 * Holds the one live subscription to the signed-in user's cloud Matrix for
 * the whole app: the matrix, Completed and the header all read it. Once the
 * user has signed out, here or in another tab, it clears the device.
 */
export const CloudMatrixSync = () => {
  const { user, isLoading } = useAuth();
  const uid = user?.uid;
  const isSignedOut = !isLoading && !uid;

  useEffect(() => {
    if (!uid) return;
    cancelDeviceClear();
    return subscribeToCloudMatrix(uid);
  }, [uid]);

  // Runs after the unsubscribe above
  useEffect(() => {
    if (isSignedOut) void clearDeviceIfRequested();
  }, [isSignedOut]);

  return null;
};
