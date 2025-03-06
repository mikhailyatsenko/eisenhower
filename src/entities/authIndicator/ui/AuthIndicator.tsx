'use client';

import { useState } from 'react';
import GoogleIcon from '@/shared/icons/google-icon.svg';

export const AuthIndicator = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`bg-foreground/50 fixed top-0 left-0 z-20 overflow-hidden transition-all duration-300 ${isOpen ? 'h-100 w-100 p-5 shadow-lg' : 'h-12 w-12 cursor-pointer'}`}
      style={{
        clipPath: isOpen ? 'circle(100% at 0 0)' : 'circle(100% at 0 0)',
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {isOpen ? (
        <div className="flex flex-col items-center">
          <p className="mb-2 text-center">
            Your matrix is currently stored only on this device. To create a
            cloud matrix accessible from different devices, sign in with Google
          </p>
          <button className="cursor-pointer px-3 py-1" onClick={handleToggle}>
            Got it
          </button>
        </div>
      ) : (
        <div className="flex h-full w-full p-0.5" onClick={handleToggle}>
          <GoogleIcon className="fill-foreground h-8 w-8" />
        </div>
      )}
    </div>
  );
};
