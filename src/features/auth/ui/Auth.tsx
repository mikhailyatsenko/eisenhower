'use client';

import { useState } from 'react';
import { AuthIndicator } from '@/entities/authIndicator';
import { useAuth } from '@/shared/api/auth';
import {
  cancelDeviceClear,
  requestDeviceClear,
} from '@/shared/api/cloudMatrix';
import {
  selectPendingChangesCount,
  useSyncStore,
} from '@/shared/stores/syncStore';
import { SignOutDialog } from '../components/SignOutDialog';

interface AuthProps {
  /** The account button, shown while the menu is closed */
  accountButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const Auth: React.FC<AuthProps> = ({ accountButtonRef }) => {
  const { user, handleGoogleSignIn, handleLogout, isLoading } = useAuth();

  // Pending changes when Sign out was pressed; undefined while not asking
  const [pendingChanges, setPendingChanges] = useState<number | null>();

  // Signed out meanwhile (the session ended, another tab): nothing to ask.
  // Signing out now would clear the queue an expired session keeps.
  if (!user && pendingChanges !== undefined) setPendingChanges(undefined);

  // Signing out leaves none of the user's tasks on the device
  const signOut = () => {
    requestDeviceClear();
    handleLogout().catch((error) => {
      cancelDeviceClear();
      console.error('Signing out failed:', error);
    });
  };

  // With Pending changes, ask first: signing out would lose them
  const handleSignOut = () => {
    const count = selectPendingChangesCount(useSyncStore.getState());
    if (count === 0) signOut();
    else setPendingChanges(count);
  };

  return (
    <div
      className={`${isLoading ? 'opacity-20' : 'opacity-100'} relative z-50`}
    >
      <AuthIndicator
        photoURL={user?.photoURL || undefined}
        displayName={user?.displayName || undefined}
        isSignedIn={!!user}
        handleGoogleSignIn={handleGoogleSignIn}
        handleLogout={handleSignOut}
        accountButtonRef={accountButtonRef}
      />
      {pendingChanges !== undefined && (
        <SignOutDialog
          pendingChanges={pendingChanges}
          onStay={() => setPendingChanges(undefined)}
          onSignOut={() => {
            setPendingChanges(undefined);
            signOut();
          }}
          // The menu closes behind the dialog, taking Sign out with it
          restoreFocus={() => accountButtonRef.current?.focus()}
        />
      )}
    </div>
  );
};
