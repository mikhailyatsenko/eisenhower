'use client';

import { useEffect } from 'react';
import { useAuth } from '@/shared/api/auth';
import { subscribeToCloudMatrix } from '@/shared/stores/tasksStore';

/**
 * Holds the one live subscription to the signed-in user's cloud Matrix for
 * the whole app: the matrix, Completed and the header all read it.
 */
export const CloudMatrixSync = () => {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (uid) return subscribeToCloudMatrix(uid);
  }, [uid]);

  return null;
};
