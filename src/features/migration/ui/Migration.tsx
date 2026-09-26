'use client';

import { useEffect } from 'react';
import { useAuth } from '@/shared/api/auth';
import { startMigration } from '../model';

/** Moves the device's Matrix to the cloud when a user signs in */
export const Migration = () => {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    return startMigration();
  }, [uid]);

  return null;
};
