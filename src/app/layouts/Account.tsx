'use client';

import { useRef } from 'react';
import { Auth } from '@/features/auth';
import { Migration } from '@/features/migration';

/** Signing in and out, and moving the device's Matrix on sign-in */
export const Account = () => {
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Migration restoreFocus={() => accountButtonRef.current?.focus()} />
      <Auth accountButtonRef={accountButtonRef} />
    </>
  );
};
