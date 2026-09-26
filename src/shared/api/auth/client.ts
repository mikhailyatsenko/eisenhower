import {
  Auth,
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as signOutOfFirebase,
} from 'firebase/auth';
import { app } from '@/shared/config/firebaseConfig';
import { CloudUser } from './types';

// The only module that talks to Firebase Auth

let auth: Auth | null = null;
const getAuthInstance = () => (auth ??= getAuth(app));

const toCloudUser = (user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}): CloudUser => ({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL,
});

/** Calls back with the current user now and on every sign-in and sign-out */
export const onUserChanged = (next: (user: CloudUser | null) => void) =>
  onAuthStateChanged(getAuthInstance(), (user) =>
    next(user ? toCloudUser(user) : null),
  );

export const signInWithGoogle = async () =>
  toCloudUser(
    (await signInWithPopup(getAuthInstance(), new GoogleAuthProvider())).user,
  );

export const signInWithGithub = async () =>
  toCloudUser(
    (await signInWithPopup(getAuthInstance(), new GithubAuthProvider())).user,
  );

export const signOut = () => signOutOfFirebase(getAuthInstance());
