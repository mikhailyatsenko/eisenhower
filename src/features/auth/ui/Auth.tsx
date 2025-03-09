'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthIndicator } from '@/entities/authIndicator';
import {
  getAllFirebaseTasks,
  getAllLocalTasks,
  useTaskStore,
} from '@/entities/Tasks';

export const Auth: React.FC = () => {
  const { user, handleGoogleSignIn, handleLogout, isLoading } = useAuth();

  const localTasks = useTaskStore(getAllLocalTasks);
  const cloudTasks = useTaskStore(getAllFirebaseTasks);

  if (isLoading) {
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
