'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/shared/api/auth';
import {
  cancelDeviceClear,
  requestDeviceClear,
} from '@/shared/api/cloudMatrix';
import {
  selectPendingChangesCount,
  useSyncStore,
} from '@/shared/stores/syncStore';
import { AccountMenu } from '../components/AccountMenu';
import { SignedOutAccount } from '../components/SignedOutAccount';
import { SignOutDialog } from '../components/SignOutDialog';

interface AuthProps {
  /** The signed-in account's avatar button */
  accountButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const Auth: React.FC<AuthProps> = ({ accountButtonRef }) => {
  const { user, handleGoogleSignIn, handleLogout, isLoading } = useAuth();

  // Pending changes when Sign out was pressed; undefined while not asking
  const [pendingChanges, setPendingChanges] = useState<number | null>();

  // Signed out meanwhile (the session ended, another tab): nothing to ask.
  // Signing out now would clear the queue an expired session keeps.
  if (!user && pendingChanges !== undefined) setPendingChanges(undefined);

  // Signing in unmounts the button that had the focus ("Sign in" in the
  // header or over the empty matrix): it goes on to the avatar instead of
  // the page. Not on a page opened signed in, nor past a dialog that has it.
  const wasSignedOut = useRef(false);
  useEffect(() => {
    if (
      user &&
      wasSignedOut.current &&
      document.activeElement === document.body
    )
      accountButtonRef.current?.focus();
    wasSignedOut.current = !user && !isLoading;
  }, [user, isLoading, accountButtonRef]);

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
    <div className={isLoading ? 'opacity-20' : 'opacity-100'}>
      {user ? (
        <AccountMenu
          displayName={user.displayName}
          email={user.email}
          photoURL={user.photoURL}
          onSignOut={handleSignOut}
          avatarRef={accountButtonRef}
        />
      ) : (
        <SignedOutAccount onSignIn={handleGoogleSignIn} />
      )}
      {pendingChanges !== undefined && (
        <SignOutDialog
          pendingChanges={pendingChanges}
          onStay={() => setPendingChanges(undefined)}
          onSignOut={() => {
            setPendingChanges(undefined);
            signOut();
          }}
          restoreFocus={() => accountButtonRef.current?.focus()}
        />
      )}
    </div>
  );
};
