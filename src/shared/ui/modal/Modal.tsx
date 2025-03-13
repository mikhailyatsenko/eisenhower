'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useScrollLock } from '@/shared/hooks/useScrollLock';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export const Modal = ({ children, onClose }: ModalProps) => {
  useScrollLock();

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center overflow-y-auto bg-black/50">
      <div
        ref={contentRef}
        className="animate-from-bottom-appear text-foreground relative mx-auto flex h-[calc(100dvh-80px)] w-[calc(100vw-80px)] flex-col items-center justify-center overflow-hidden rounded-md bg-gray-200 opacity-0 [animation-duration:_0.2s] dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
