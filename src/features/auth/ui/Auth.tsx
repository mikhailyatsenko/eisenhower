'use client';

import { AuthIndicator } from '@/entities/authIndicator';
import { useAuth } from '@/shared/api/auth';
import {
  cancelDeviceClear,
  requestDeviceClear,
} from '@/shared/api/cloudMatrix';
import { useTaskStore } from '@/shared/stores/tasksStore';

export const Auth: React.FC = () => {
  const { user, handleGoogleSignIn, handleLogout, isLoading } = useAuth();

  const { localTasks } = useTaskStore();
  const { firebaseTasks } = useTaskStore();

  // Signing out leaves none of the user's tasks on the device
  const handleSignOut = () => {
    requestDeviceClear();
    handleLogout().catch((error) => {
      cancelDeviceClear();
      console.error('Signing out failed:', error);
    });
  };

  return (
    <div
      className={`${isLoading ? 'opacity-20' : 'opacity-100'} relative z-50`}
    >
      <AuthIndicator
        localTasks={localTasks}
        cloudTasks={firebaseTasks}
        photoURL={user?.photoURL || undefined}
        displayName={user?.displayName || undefined}
        isSignedIn={!!user}
        handleGoogleSignIn={handleGoogleSignIn}
        handleLogout={handleSignOut}
      />
    </div>
  );
};
