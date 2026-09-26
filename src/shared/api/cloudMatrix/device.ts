import { clearDevice } from './client';
import { setSignedOut } from './signedOut';

// Signing out always leaves the device without the user's Matrix. The request
// is kept in localStorage, shared by all tabs: every tab that sees the user
// gone lets go of IndexedDB, and a clearing that failed is tried again on the
// next visit without a signed-in user. Losing the session sets no request, so
// the queue in IndexedDB waits for the same user to sign in again.

const CLEAR_REQUEST_KEY = 'eisenhower-clear-cloud-device';

// Where localStorage is unavailable, at least this tab remembers the request
let isRequestedInThisTab = false;
let clearing: Promise<void> | null = null;

/** Sign out asked for the device to be cleared, and it isn't yet */
export const isDeviceClearRequested = () => {
  if (isRequestedInThisTab) return true;
  try {
    return localStorage.getItem(CLEAR_REQUEST_KEY) !== null;
  } catch {
    return false;
  }
};

const setClearRequested = (isRequested: boolean) => {
  isRequestedInThisTab = isRequested;
  try {
    if (isRequested) localStorage.setItem(CLEAR_REQUEST_KEY, 'true');
    else localStorage.removeItem(CLEAR_REQUEST_KEY);
  } catch {
    // The flag in memory has to do
  }
};

/**
 * Call right before signing out: the device is cleared once the user is gone,
 * and remembers the user signed out
 */
export const requestDeviceClear = () => {
  setClearRequested(true);
  setSignedOut(true);
};

/**
 * Call on sign-in, or when signing out failed: the device now holds this
 * user's queue, which a lost session must not clear. The next Sign out
 * clears the device again.
 */
export const cancelDeviceClear = () => {
  setClearRequested(false);
  setSignedOut(false);
};

/** Call when no one is signed in and nothing is subscribed any more */
export const clearDeviceIfRequested = () => {
  if (!clearing && isDeviceClearRequested()) {
    clearing = clearDevice()
      .then(() => setClearRequested(false))
      // E.g. another tab still holds IndexedDB: the next visit tries again
      .catch((error) =>
        console.error(
          'Clearing the cloud Matrix from the device failed:',
          error,
        ),
      )
      .finally(() => {
        clearing = null;
      });
  }
  return clearing ?? Promise.resolve();
};
