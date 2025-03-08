import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '@/shared/config/firebaseConfig';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoadingAction] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoadingAction(true);
      setUser(currentUser);

      setLoadingAction(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return { user, isLoading, handleGoogleSignIn, handleLogout };
};
