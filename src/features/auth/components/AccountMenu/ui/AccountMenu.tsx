'use client';

import Image from 'next/image';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

interface AccountMenuProps {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  onSignOut: () => void;
  /** The avatar button, where the focus comes back to */
  avatarRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * A signed-in user's avatar in the header and its menu, by the WAI-ARIA menu
 * button pattern. The name, the email and where the tasks are kept are the
 * menu's description, not its items.
 */
export const AccountMenu: React.FC<AccountMenuProps> = ({
  displayName,
  email,
  photoURL,
  onSignOut,
  avatarRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const avatarId = useId();
  const menuId = useId();
  const descriptionId = useId();

  const name = displayName || email || 'Account';

  // Opening from the avatar puts the focus on the first item
  useLayoutEffect(() => {
    if (isOpen) firstItemRef.current?.focus();
  }, [isOpen]);

  // A click or a tap outside. Not by the focus: iOS Safari keeps it on a
  // tap, and Safari and Firefox on macOS don't focus a clicked button.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const closeToAvatar = () => {
    setIsOpen(false);
    avatarRef.current?.focus();
  };

  const handleAvatarKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeToAvatar();
        break;
      // One item: the arrows, Home and End keep the focus on it
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        event.preventDefault();
        firstItemRef.current?.focus();
        break;
      // Tab moves the focus on past the menu, and leaving closes it.
      // Shift+Tab lands on the avatar, inside, so it closes here.
      case 'Tab':
        if (event.shiftKey) {
          event.preventDefault();
          closeToAvatar();
        }
        break;
    }
  };

  // Tab moves the focus out. Focus lost to nothing (a click that doesn't
  // focus, even on the avatar) is left to the pointerdown above.
  const handleBlur = (event: React.FocusEvent) => {
    if (
      event.relatedTarget &&
      !wrapperRef.current?.contains(event.relatedTarget)
    )
      setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} onBlur={handleBlur} className="shrink-0">
      <button
        ref={avatarRef}
        id={avatarId}
        type="button"
        aria-label={name}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleAvatarKeyDown}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:outline-none dark:focus-visible:ring-indigo-300"
      >
        {photoURL ? (
          <Image
            src={photoURL}
            alt=""
            className="h-8 w-8 rounded-full"
            width={32}
            height={32}
          />
        ) : (
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-sm font-semibold text-white dark:bg-indigo-300 dark:text-gray-900"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </button>
      {isOpen && (
        // Under the header and the sync bar at the right edge of the page:
        // the header's backdrop blur makes it the containing block
        <div className="motion-safe:animate-menu-fade-in absolute top-[calc(var(--top-bars-height,56px)+0.25rem)] right-2 w-72 max-w-[calc(100vw-1rem)] rounded-lg border border-gray-200 bg-white p-2 shadow-lg sm:right-4 dark:border-gray-700 dark:bg-gray-900">
          <div id={descriptionId} className="px-3 py-2">
            {displayName && (
              <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                {displayName}
              </p>
            )}
            <p className="truncate text-sm text-gray-600 dark:text-gray-400">
              {email}
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Saved to your Google account
            </p>
          </div>
          <div
            id={menuId}
            role="menu"
            aria-labelledby={avatarId}
            aria-describedby={descriptionId}
            onKeyDown={handleMenuKeyDown}
            className="mt-1 border-t border-gray-200 pt-1 dark:border-gray-700"
          >
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                // A dialog asking first returns the focus to the avatar
                closeToAvatar();
                onSignOut();
              }}
              className="flex min-h-11 w-full cursor-pointer items-center rounded-md px-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-700 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:focus-visible:outline-indigo-300"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
