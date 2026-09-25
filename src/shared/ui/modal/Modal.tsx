'use client';

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { useScrollLock } from '@/shared/hooks/useScrollLock';

interface ModalProps {
  children: ReactNode;
  /** Accessible name of the dialog */
  label: string;
  /** Id of the element whose text describes the dialog */
  describedBy?: string;
  onClose: () => void;
  /**
   * Where the focus goes once the dialog is gone. By default it goes back to
   * the element that had it when the dialog opened.
   */
  restoreFocus?: () => void;
  className?: string;
  width?: 'lg' | 'xl' | '2xl';
}

const widthClasses = {
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

/**
 * A native <dialog> opened with showModal(): the browser makes the page
 * behind it inert and closes it on Escape. Open while mounted.
 */
export const Modal = ({
  children,
  label,
  describedBy,
  onClose,
  restoreFocus,
  className,
  width = 'lg',
}: ModalProps) => {
  useScrollLock();
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Read on the first render: the form's autoFocus moves the focus before effects
  const [opener] = useState(() =>
    typeof document === 'undefined' ? null : document.activeElement,
  );
  const callbacks = useRef({ onClose, restoreFocus });
  // A click that starts in the form and ends on the backdrop doesn't close it
  const isBackdropPressed = useRef(false);

  useEffect(() => {
    callbacks.current = { onClose, restoreFocus };
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Layout effect: its cleanup runs while the <dialog> is still on the page,
  // so the focus goes back without passing through <body>
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // The browser closes the dialog on Escape, the owner unmounts it then
    const handleClose = () => callbacks.current.onClose();

    dialog.addEventListener('close', handleClose);
    dialog.showModal();

    return () => {
      dialog.removeEventListener('close', handleClose);
      if (dialog.open) dialog.close();
      const { restoreFocus: restore } = callbacks.current;
      if (restore) restore();
      else if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
  }, [mounted, opener]);

  if (!mounted) return null;

  return createPortal(
    // The backdrop is part of the <dialog>: a click on the dialog itself,
    // outside the content, is a click on the backdrop
    <dialog
      ref={dialogRef}
      aria-label={label}
      aria-describedby={describedBy}
      className={twMerge(
        'm-auto h-fit max-h-[calc(100dvh-40px)] w-[calc(100%-2rem)] overflow-visible bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm',
        widthClasses[width],
      )}
      onPointerDown={(event) => {
        isBackdropPressed.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        // Clicks stay in the dialog, like before the portal
        event.stopPropagation();
        if (isBackdropPressed.current && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={twMerge(
          'animate-from-bottom-appear text-foreground relative flex max-h-[calc(100dvh-40px)] w-full flex-col items-center rounded-xl bg-gray-50 opacity-0 shadow-2xl [animation-duration:_0.2s] dark:bg-gray-900',
          className,
        )}
      >
        {children}
      </div>
    </dialog>,
    document.body,
  );
};
