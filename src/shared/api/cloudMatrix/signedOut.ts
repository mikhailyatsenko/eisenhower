import { useSyncExternalStore } from 'react';

// The user signed out, here or in another tab, and hasn't signed in or added
// a task since: an empty matrix is where their tasks aren't, not a first
// visit. Unlike the clear request it outlives the clearing. A lost session
// doesn't set it.

const SIGNED_OUT_KEY = 'eisenhower-signed-out';

// Where localStorage is unavailable, at least this tab remembers it
let isSignedOutInThisTab = false;
const listeners = new Set<() => void>();

const isSignedOut = () => {
  try {
    return localStorage.getItem(SIGNED_OUT_KEY) !== null;
  } catch {
    return isSignedOutInThisTab;
  }
};

export const setSignedOut = (isSignedOutNow: boolean) => {
  if (isSignedOutNow === isSignedOut()) return;
  isSignedOutInThisTab = isSignedOutNow;
  try {
    if (isSignedOutNow) localStorage.setItem(SIGNED_OUT_KEY, 'true');
    else localStorage.removeItem(SIGNED_OUT_KEY);
  } catch {
    // The flag in memory has to do
  }
  listeners.forEach((listener) => listener());
};

/** The first task on the device: the matrix is the user's own again */
export const forgetSignOut = () => setSignedOut(false);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Another tab signed out or added a task
  const onStorage = (event: StorageEvent) => {
    if (event.key === SIGNED_OUT_KEY || event.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

/** Signed out with Sign out and nothing done since; false on the server */
export const useIsSignedOut = () =>
  useSyncExternalStore(subscribe, isSignedOut, () => false);
