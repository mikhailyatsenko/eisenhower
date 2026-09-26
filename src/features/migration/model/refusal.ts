import { isDeviceClearRequested } from '@/shared/api/cloudMatrix';

// The user said no to moving the device's tasks into this account: after
// Undo, reloads don't offer the move again. Its own localStorage key, shared
// by all tabs, so a Sign out in any of them erases it. Without localStorage
// the device keeps no tasks between visits either, so nothing is lost.

const REFUSAL_KEY = 'eisenhower-migration-refused';

/** No Migration into this user's account while they stay signed in */
export const refuseMigration = (uid: string) => {
  try {
    localStorage.setItem(REFUSAL_KEY, uid);
  } catch {
    // Nowhere to keep it: the next start offers the move again
  }
};

export const isMigrationRefused = (uid: string) => {
  try {
    return localStorage.getItem(REFUSAL_KEY) === uid;
  } catch {
    return false;
  }
};

/**
 * Call when the user is gone. A Sign out, here or in another tab, asked for
 * the device to be cleared: the next sign-in offers the move again. A lost
 * session keeps the refusal for the same user.
 */
export const forgetMigrationRefusalOnSignOut = () => {
  if (!isDeviceClearRequested()) return;
  try {
    localStorage.removeItem(REFUSAL_KEY);
  } catch {
    // Nothing stored
  }
};
