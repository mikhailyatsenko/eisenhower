'use client';

import Image from 'next/image';

import { useRouter, useSearchParams } from 'next/navigation';

import { useState } from 'react';

import GoogleIcon from '@/shared/icons/google-icon.svg';
import UserIcon from '@/shared/icons/user-icon.svg';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { Task } from '@/shared/stores/tasksStore';
import { BubbleCornerButton } from '@/shared/ui/bubbleCornerButton';
import { SignWihGoogleButton } from '@/shared/ui/signWihGoogleButton';

export interface AuthIndicatorProps {
  handleGoogleSignIn: () => void;
  displayName?: string;
  photoURL?: string;
  isSignedIn: boolean;
  handleLogout: () => void;
  localTasks: Record<MatrixKey, Task[]>;
  cloudTasks: Record<MatrixKey, Task[]>;
}

export const quadrantBgStyles = {
  ImportantUrgent: 'bg-red-200',
  ImportantNotUrgent: 'bg-amber-200',
  NotImportantUrgent: 'bg-blue-200 ',
  NotImportantNotUrgent: 'bg-green-200',
};

export const AuthIndicator: React.FC<AuthIndicatorProps> = ({
  handleGoogleSignIn,
  photoURL,
  isSignedIn,
  handleLogout,
  displayName,
  localTasks,
  cloudTasks,
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

  const router = useRouter();
  const handleSwitchToFirebase = () => {
    router.push('?cloud');
  };

  const handleSwitchToLocal = () => {
    router.push('/');
  };

  const searchParams = useSearchParams();

  const isCloud = searchParams && searchParams.has('cloud');

  const [isOpen, setIsOpen] = useState(false);

  return (
    <BubbleCornerButton
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      iconWhenClosed={
        isSignedIn ? userImage : <GoogleIcon className="h-5 w-5 fill-white" />
      }
    >
      {isSignedIn ? (
        <div className="flex h-full flex-col gap-8">
          <div className="flex w-full items-center gap-2">
            {userImage}
            <div>Logged in as {displayName}</div>
          </div>
          <div className="flex w-[85%] flex-wrap justify-around">
            <div
              onClick={handleSwitchToFirebase}
              className={`flex cursor-pointer flex-col items-center rounded-sm p-2 ${isCloud ? 'bg-gray-100/30' : ''} hover:bg-gray-100/30`}
            >
              <h3 className="mb-2 text-sm leading-3 font-bold">Cloud Matrix</h3>
              <div className="flex w-14 flex-wrap text-sm font-bold">
                {Object.keys(cloudTasks).map((key) => (
                  <div
                    key={key}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center text-gray-500 ${quadrantBgStyles[key as MatrixKey]}`}
                  >
                    {cloudTasks[key as MatrixKey].length}
                  </div>
                ))}
              </div>
            </div>
            <div
              onClick={handleSwitchToLocal}
              className={`flex cursor-pointer flex-col items-center rounded-sm p-2 ${!isCloud ? 'bg-gray-100/30' : ''} hover:bg-gray-100/30`}
            >
              <h3 className="mb-2 text-sm leading-3 font-bold">Local Matrix</h3>
              <div className="flex w-14 flex-wrap text-sm font-bold">
                {Object.keys(localTasks).map((key) => (
                  <div
                    key={key}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center text-gray-500 ${quadrantBgStyles[key as MatrixKey]}`}
                  >
                    {localTasks[key as MatrixKey].length}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 flex w-full justify-center">
              <button
                className="flex w-fit cursor-pointer items-center justify-center rounded-lg border-2 border-gray-100 px-4 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-50 dark:border-gray-300 dark:text-gray-100 dark:hover:bg-gray-900"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col gap-2">
          <p className="mb-2 w-full">
            Your matrix is currently stored{' '}
            <strong>only on this device.</strong>{' '}
          </p>
          <p className="mb-4 w-[98%]">
            To create a cloud matrix accessible from different devices,{' '}
            <strong onClick={handleGoogleSignIn}>sign in with Google</strong>
          </p>
          <div className="flex w-[85%]">
            <SignWihGoogleButton onClick={handleGoogleSignIn} />
          </div>
        </div>
      )}
    </BubbleCornerButton>
  );
};
