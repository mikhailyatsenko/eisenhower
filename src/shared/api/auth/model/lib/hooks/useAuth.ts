import {
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '@/shared/config/firebaseConfig';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      setUser(currentUser);

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        console.log('Authentication error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleGithubSignIn = async () => {
    const provider = new GithubAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        console.log('Authentication error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLogout = async () => {
    await signOut(auth);
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
