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
import { syncTasks } from '@/entities/Matrix';
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

  if (user) {
    return (
      <>
        <div>Logged in as {user.displayName}</div>
        <div>{user.displayName}</div>
        <button onClick={handleLogout}>Logout</button>
      </>
    );
  }

  return <AuthIndicator handleGoogleSignIn={handleGoogleSignIn} />;
};
