// import { onAuthStateChanged } from 'firebase/auth';
// import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
// import { auth } from '@/firebaseConfig';
import { TaskMatrix } from '@/widgets/taskMatrix';
import { AddTask } from '@/features/addTask';
import { Auth } from '@/features/auth/ui/Auth';
import { WelcomeModal } from '@/entities/welcomeModal';

export const HomePage = () => {
  // const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //   });

  //   return () => unsubscribe();
  // }, []);

  return (
    <div className="mx-auto w-[calc(100%-48px)] pt-6 lg:w-5/6">
      {/* w-[calc(100%-48px)] because we have names of lines at the left with absolute position */}
      <WelcomeModal />
      <AddTask />
      <TaskMatrix />

      <Auth />

      <ToastContainer />
    </div>
  );
};
