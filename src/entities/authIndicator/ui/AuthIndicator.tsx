'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import GoogleIcon from '@/shared/icons/google-icon.svg';
import { SignWihGoogleButton } from '@/shared/ui/signWihGoogleButton';

interface AuthIndicatorProps {
  handleGoogleSignIn: () => void;
}

export const AuthIndicator: React.FC<AuthIndicatorProps> = ({
  handleGoogleSignIn,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    setIsOpen(false);
    setIsHidden(window.scrollY >= 50);
  }, []);

  useEffect(() => {
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, handleClickOutside, handleEscKey]);

  return (
    <div
      ref={ref}
      className={`fixed top-0 left-0 z-20 overflow-hidden bg-indigo-200/95 transition-all duration-300 [clip-path:_circle(100%_at_0_0)] dark:bg-indigo-950/95 ${isOpen ? 'h-90 w-90 p-5 shadow-lg' : 'h-12 w-12 cursor-pointer hover:h-14 hover:w-14 hover:p-1'} ${isHidden ? '-translate-x-full -translate-y-full' : 'translate-x-0 translate-y-0'}`}
      onClick={() => setIsOpen(true)}
    >
      {isOpen ? (
        <div className="flex h-full flex-col gap-2">
          <p className="mb-2 w-full">
            Your matrix is currently stored{' '}
            <strong>only on this device.</strong>
          </p>
          <p className="mb-4 w-[98%]">
            To create a cloud matrix accessible from different devices,{' '}
            <strong>sign in with Google</strong>
          </p>

          <div className="flex w-[85%]">
            <SignWihGoogleButton onClick={handleGoogleSignIn} />
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full p-0.5">
          <GoogleIcon className="fill-foreground h-8 w-8" />
        </div>
      )}
    </div>
  );
};
