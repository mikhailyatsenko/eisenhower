'use client';

import Image from 'next/image';

import { useState } from 'react';

import UserIcon from '@/shared/icons/user-icon.svg';
import { BubbleCornerButton } from '@/shared/ui/bubbleCornerButton';

export interface AuthIndicatorProps {
  displayName?: string;
  photoURL?: string;
  handleLogout: () => void;
  /** The account button, shown while the menu is closed */
  accountButtonRef?: React.Ref<HTMLButtonElement>;
}

/** The signed-in account button and its menu */
export const AuthIndicator: React.FC<AuthIndicatorProps> = ({
  photoURL,
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

  const [isOpen, setIsOpen] = useState(false);

  return (
    <BubbleCornerButton
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      closedLabel={displayName || 'Account'}
      closedButtonRef={accountButtonRef}
      iconWhenClosed={userImage}
    >
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
    </BubbleCornerButton>
  );
};
