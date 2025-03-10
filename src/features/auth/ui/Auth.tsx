'use client';

import { AuthIndicator } from '@/entities/authIndicator';
import {
  getAllFirebaseTasks,
  getAllLocalTasks,
  useTaskStore,
} from '@/entities/Tasks';
import { useAuth } from '@/shared/api/auth';

export const Auth: React.FC = () => {
  const { user, handleGoogleSignIn, handleLogout, isLoading } = useAuth();

  const localTasks = useTaskStore(getAllLocalTasks);
  const cloudTasks = useTaskStore(getAllFirebaseTasks);

  return (
    <div
      className={`${isLoading ? 'opacity-20' : 'opacity-100'} relative z-50`}
    >
      <AuthIndicator
        localTasks={localTasks}
        cloudTasks={cloudTasks}
        photoURL={user?.photoURL || undefined}
        displayName={user?.displayName || undefined}
        isSignedIn={!!user}
        handleGoogleSignIn={handleGoogleSignIn}
        handleLogout={handleLogout}
      />
    </div>
  );
};
