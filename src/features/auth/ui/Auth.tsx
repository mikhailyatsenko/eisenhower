'use client';

import {
  // createUserWithEmailAndPassword,
  // signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import React from 'react';
import { auth } from '@/firebaseConfig';

export const Auth: React.FC = () => {
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  // const [isRegistering, setIsRegistering] = useState(false);

  // const handleAuth = async () => {
  //   try {
  //     if (isRegistering) {
  //       await createUserWithEmailAndPassword(auth, email, password);
  //       console.log('User registered successfully');
  //     } else {
  //       await signInWithEmailAndPassword(auth, email, password);
  //       console.log('User signed in successfully');
  //     }
  //   } catch (error) {
  //     console.error('Authentication error:', error);
  //   }
  // };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log('Attempting to sign in with Google');
      await signInWithPopup(auth, provider);
      console.log('User signed in with Google successfully');
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div>
      {/* <h1>{isRegistering ? 'Register' : 'Login'}</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth}>
        {isRegistering ? 'Register' : 'Login'}
      </button>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
      </button> */}
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
};
