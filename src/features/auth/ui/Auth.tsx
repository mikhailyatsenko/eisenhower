'use client';

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import React, { useEffect } from 'react';
import { auth } from '@/firebaseConfig';
import { AuthIndicator } from '@/entities/authIndicator';
import {
  getAllFirebaseTasks,
  getAllLocalTasks,
  syncTasks,
} from '@/entities/Tasks';
import { useTaskStore } from '@/entities/Tasks';
import { setLoadingAction } from '@/entities/Tasks/model/store/uiStore';
import { useUserStore } from '@/entities/user';

export const Auth: React.FC = () => {
  const { setUser, user } = useUserStore();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log('Attempting to sign in with Google');
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log('User signed in with Google successfully');
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoadingAction(true);
      setUser(currentUser);
      if (currentUser) {
        await syncTasks();
      }
      console.log('Tasks synced');
      setLoadingAction(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const localTasks = useTaskStore(getAllLocalTasks);
  const cloudTasks = useTaskStore(getAllFirebaseTasks);

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
