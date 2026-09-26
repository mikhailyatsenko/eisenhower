'use client';

import { useEffect } from 'react';
import { useAuth } from '@/shared/api/auth';
import { forgetMigrationRefusalOnSignOut, startMigration } from '../model';

/**
 * Moves the device's Matrix to the cloud when a user signs in. Sign out, here
 * or in another tab, erases a refusal: the next sign-in offers the move again.
 */
export const Migration = () => {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    const stop = startMigration(uid);
    return () => {
      stop();
      forgetMigrationRefusalOnSignOut();
    };
  }, [uid]);

  return null;
};
