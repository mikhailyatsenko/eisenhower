'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useScrollLock } from '../lib/useScrollLock';

export default function Popup({ children }: PropsWithChildren) {
  useScrollLock();

  const [isShowPopup, setIsShowPopup] = useState(true);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClose = () => {
      setIsShowPopup(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    isShowPopup && (
      <div className="fixed inset-0 z-[19] flex items-center overflow-y-auto bg-black/50">
        <div
          ref={contentRef}
          className="animate-from-bottom-appear bg-background mx-auto h-[calc(100dvh-80px)] w-[calc(100vw-80px)] overflow-hidden rounded-md opacity-0 [animation-duration:_0.2s]"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>

        {/* <ButtonBack
        className={`animate-fadeIn fixed top-28 left-1/2 z-2 mx-auto -translate-x-1/2 opacity-0 transition-transform duration-[0.2s] ${
          isScrolled ? 'scale-0 opacity-0' : ''
        }`}
        aria-label="Back"
        title="Back"
        onClick={(e) => {
          e.stopPropagation();
        }}
      /> */}
      </div>
    )
  );
}
