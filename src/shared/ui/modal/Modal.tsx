'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '@/shared/hooks/useScrollLock';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  className?: string;
  width?: 'lg' | 'xl' | '2xl';
}

const widthClasses = {
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal = ({
  children,
  onClose,
  className,
  width = 'lg',
}: ModalProps) => {
  useScrollLock();
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
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

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        ref={contentRef}
        className={`animate-from-bottom-appear text-foreground relative mx-auto flex h-fit max-h-[calc(100dvh-40px)] w-full ${widthClasses[width]} flex-col items-center rounded-xl opacity-0 shadow-2xl [animation-duration:_0.2s] ${className || 'bg-gray-50 dark:bg-gray-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
};
