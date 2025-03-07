'use client';

import GoogleIcon from '@/shared/icons/google-icon.svg';
import { BubbleCornerButton } from '@/shared/ui/bubbleCornerButton';
import { SignWihGoogleButton } from '@/shared/ui/signWihGoogleButton';

interface AuthIndicatorProps {
  handleGoogleSignIn: () => void;
}

export const AuthIndicator: React.FC<AuthIndicatorProps> = ({
  handleGoogleSignIn,
}) => {
  return (
    <BubbleCornerButton
      iconWhenClosed={<GoogleIcon className="fill-foreground h-8 w-8" />}
    >
      <div className="flex h-full flex-col gap-2">
        <p className="mb-2 w-full">
          Your matrix is currently stored <strong>only on this device.</strong>{' '}
        </p>
        <p className="mb-4 w-[98%]">
          To create a cloud matrix accessible from different devices,{' '}
          <strong>sign in with Google</strong>
        </p>
        <div className="flex w-[85%]">
          <SignWihGoogleButton onClick={handleGoogleSignIn} />
        </div>
      </div>
    </BubbleCornerButton>
  );
};
