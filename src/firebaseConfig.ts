import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyA6B3ucxboxyA-CuVeWBovWbBo1bRE8eS4',

  authDomain: 'eisenhower-3a50e.firebaseapp.com',

  projectId: 'eisenhower-3a50e',

  storageBucket: 'eisenhower-3a50e.firebasestorage.app',

  messagingSenderId: '502682309080',

  appId: '1:502682309080:web:ab3ec007bc7bb29910e2ad',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
