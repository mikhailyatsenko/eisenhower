'use client';

import React, { useEffect, useState } from 'react';
import { AuthIndicator } from '@/entities/authIndicator';
import {
  getAllFirebaseTasks,
  getAllLocalTasks,
  useTaskStore,
  syncTasks,
} from '@/entities/Tasks';
import { useAuth } from '@/shared/api/auth';
export const Auth: React.FC = () => {
  const { user, handleGoogleSignIn, handleLogout, isLoading } = useAuth();
  const [isSyncingTasks, setIsSyncingTasks] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsSyncingTasks(true);
      if (user) {
        await syncTasks(user);
      } else {
        useTaskStore.setState((state) => {
          state.firebaseTasks = {
            ImportantUrgent: [],
            ImportantNotUrgent: [],
            NotImportantUrgent: [],
            NotImportantNotUrgent: [],
          };
        });
      }
      setIsSyncingTasks(false);
    };

    fetchTasks();
  }, [user]);

  const localTasks = useTaskStore(getAllLocalTasks);
  const cloudTasks = useTaskStore(getAllFirebaseTasks);

  if (isLoading || isSyncingTasks) {
    return <div>Loading...</div>;
  }

  return (
    <AuthIndicator
      localTasks={localTasks}
      cloudTasks={cloudTasks}
      photoURL={user?.photoURL || undefined}
      displayName={user?.displayName || undefined}
      isSignedIn={!!user}
      handleGoogleSignIn={handleGoogleSignIn}
      handleLogout={handleLogout}
    />
  );
};
