'use client';

import { useEffect, useState } from 'react';
import {
  onUserChanged,
  signInWithGithub,
  signInWithGoogle,
  signOut,
} from '../../../client';
import { CloudUser } from '../../../types';

export const useAuth = () => {
  const [user, setUser] = useState<CloudUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(
    () =>
      onUserChanged((currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      }),
    [],
  );

  const signInWith = (signIn: () => Promise<CloudUser>) =>
    signIn()
      .then(setUser)
      .catch((error) => {
        console.log('Authentication error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });

  const handleGoogleSignIn = () => signInWith(signInWithGoogle);
  const handleGithubSignIn = () => signInWith(signInWithGithub);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  return {
    user,
    isLoading,
    handleGoogleSignIn,
    handleGithubSignIn,
    handleLogout,
  };
};
