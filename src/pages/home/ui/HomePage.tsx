'use client';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { auth } from '@/firebaseConfig';
import { TaskMatrix } from '@/widgets/taskMatrix';
import { AddTask } from '@/features/addTask';
import { Auth } from '@/features/auth/ui/Auth';
import { syncTasks } from '@/entities/Matrix';
import { useUserStore } from '@/entities/user';
import { WelcomeModal } from '@/entities/welcomeModal';

export const HomePage = () => {
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      console.log('currentUser', currentUser);
      if (currentUser) {
        syncTasks();
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="mx-auto w-[calc(100%-48px)] pt-6 lg:w-5/6">
      {/* w-[calc(100%-48px)] because we have names of lines at the left with absolute position */}
      <WelcomeModal />
      <AddTask />
      <TaskMatrix />
      {user ? (
        <>
          <div>{user.displayName}</div>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Auth />
      )}
      <ToastContainer />
    </div>
  );
};
