'use client';

import { useState, useEffect, useRef } from 'react';
import CloseIcon from '@/shared/icons/close-icon.svg';
import GoogleIcon from '@/shared/icons/google-icon.svg';
import { SignWihGoogleButton } from '@/shared/ui/signWihGoogleButton';

export const AuthIndicator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleScroll = () => {
    setIsOpen(false);
    if (window.scrollY >= 50) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  };

  useEffect(() => {
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

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
  }, [isOpen]);

  return (
    <div
      ref={ref}
      className={`fixed top-0 left-0 z-20 overflow-hidden bg-indigo-200/95 transition-all duration-300 [clip-path:_circle(100%_at_0_0)] dark:bg-indigo-950/95 ${isOpen ? 'h-90 w-90 p-5 shadow-lg' : 'h-12 w-12 cursor-pointer hover:h-14 hover:w-14 hover:p-1'} ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}
      onClick={() => setIsOpen(true)}
    >
      {isOpen ? (
        <div className="flex h-full flex-col">
          <p className="mb-2 w-full">
            Your matrix is currently stored{' '}
            <strong>only on this device.</strong>
          </p>
          <p className="mb-4 w-[98%]">
            To create a cloud matrix accessible from different devices,{' '}
            <strong>sign in with Google</strong>
          </p>

          <div className="flex w-[95%]">
            <SignWihGoogleButton />
          </div>

          <div className="mt-auto w-1/5 opacity-40">
            <button
              className="cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                setIsOpen(false);
              }}
            >
              <CloseIcon className="fill-foreground h-10 w-10" />
            </button>
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
