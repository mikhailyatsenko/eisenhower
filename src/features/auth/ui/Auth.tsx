'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react';
import { auth } from '@/firebaseConfig';
import { useUserStore } from '@/entities/user';

export const Auth: React.FC = () => {
  const { setUser } = useUserStore();

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

  return (
    <div>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
};
