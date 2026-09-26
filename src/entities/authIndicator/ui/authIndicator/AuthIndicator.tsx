'use client';

import Image from 'next/image';

import { useState } from 'react';

import GoogleIcon from '@/shared/icons/google-icon.svg';
import UserIcon from '@/shared/icons/user-icon.svg';
import { BubbleCornerButton } from '@/shared/ui/bubbleCornerButton';
import { SignWihGoogleButton } from '@/shared/ui/signWihGoogleButton';

export interface AuthIndicatorProps {
  handleGoogleSignIn: () => void;
  displayName?: string;
  photoURL?: string;
  isSignedIn: boolean;
  handleLogout: () => void;
  /** The account button, shown while the menu is closed */
  accountButtonRef?: React.Ref<HTMLButtonElement>;
}

export const AuthIndicator: React.FC<AuthIndicatorProps> = ({
  handleGoogleSignIn,
  photoURL,
  isSignedIn,
  handleLogout,
  displayName,
  accountButtonRef,
}) => {
  const userImage = photoURL ? (
    <Image
      src={photoURL}
      alt="User profile"
      className="h-6 w-6 rounded-full"
      width={24}
      height={24}
    />
  ) : (
    <UserIcon className="h-5 w-5 fill-white" />
  );

  const signInLabel = (
    <>
      <GoogleIcon aria-hidden className="h-5 w-5 fill-current" />
      Sign in
    </>
  );

  const [isOpen, setIsOpen] = useState(false);
  const [wasSignedIn, setWasSignedIn] = useState(isSignedIn);

  // Signed in: the menu gives way to the account button, so a dialog opened
  // on sign-in can return the focus to it
  if (isSignedIn !== wasSignedIn) {
    setWasSignedIn(isSignedIn);
    if (isSignedIn) setIsOpen(false);
  }

  return (
    <BubbleCornerButton
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      closedLabel={isSignedIn ? displayName || 'Account' : undefined}
      closedButtonRef={accountButtonRef}
      iconWhenClosed={isSignedIn ? userImage : signInLabel}
    >
      {isSignedIn ? (
        <div className="flex h-full flex-col gap-8">
          <div className="flex w-full items-center gap-2">
            {userImage}
            <div>Logged in as {displayName}</div>
          </div>
          <p className="w-full">Saved to your Google account</p>
          <div className="flex w-[85%] justify-center">
            <button
              className="flex w-fit cursor-pointer items-center justify-center rounded-lg border-2 border-gray-100 px-4 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-50 dark:border-gray-300 dark:text-gray-100 dark:hover:bg-gray-900"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col gap-2">
          <p className="mb-4 w-[98%]">
            <strong>Saved only on this device.</strong> Sign in with Google to
            keep your tasks in your account and use them on other devices.
          </p>
          <div className="flex w-[85%]">
            <SignWihGoogleButton
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleGoogleSignIn();
              }}
            />
          </div>
        </div>
      )}
    </BubbleCornerButton>
  );
};
