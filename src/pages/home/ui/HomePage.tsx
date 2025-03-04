'use client';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { auth } from '@/firebaseConfig';
import { fetchTasks } from '@/services/taskService';
import { TaskMatrix } from '@/widgets/taskMatrix';
import { AddTask } from '@/features/addTask';
import { Auth } from '@/features/auth/ui/Auth';
import { useTaskStore } from '@/entities/Matrix/model/store/tasksStore';
import { WelcomeModal } from '@/entities/welcomeModal';

export const HomePage = () => {
  const [user, setUser] = useState(null);
  const setTasks = useTaskStore((state) => state.setTasks);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const tasks = await fetchTasks(currentUser.uid);
        setTasks(tasks);
      }
    });

    return () => unsubscribe();
  }, [setTasks]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="mx-auto w-[calc(100%-48px)] pt-6 lg:w-5/6">
      {/* w-[calc(100%-48px)] because we have names of lines at the left with absolute position */}
      <WelcomeModal />
      {user ? (
        <>
          <AddTask />
          <TaskMatrix />
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Auth />
      )}
      <ToastContainer />
    </div>
  );
};
