'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { isTouchDevice } from '@/shared/utils/isTouchDevice';

export const Footer = () => {
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  return (
    <footer className="flex w-full flex-col justify-between gap-1 border-t border-gray-100 px-6 py-8 text-xs text-gray-400 opacity-60 sm:flex-row sm:items-center sm:gap-4 dark:border-gray-800">
      <div className="flex flex-col gap-1">
        <span>Contact the author: m74901379@gmail.com</span>
      </div>
      {!isTouch && (
        <div>
          Quick add: press keys <span className="font-bold">1-4</span>
        </div>
      )}
      <Link href="/privacy" className="mr-0 hover:underline sm:mr-30">
        Privacy Policy
      </Link>
    </footer>
  );
};
