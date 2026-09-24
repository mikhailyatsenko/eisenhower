import { useEffect, useRef } from 'react';
import { isDialogOpen } from '@/shared/lib/isDialogOpen';
import { isTextField } from '@/shared/lib/isTextField';
import { matchesShortcut } from '../lib';
import type { ToastAction } from '../model';

/**
 * Runs the shown toast's action on its shortcut. Text fields keep the key,
 * and an open dialog covers the toast, so the key is left to it too.
 */
export const useActionShortcut = (action: ToastAction | undefined) => {
  const actionRef = useRef(action);
  actionRef.current = action;
  const key = action?.shortcutKey;

  useEffect(() => {
    if (!key) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      if (isTextField(event.target)) return;
      if (isDialogOpen()) return;
      if (!matchesShortcut(event, key)) return;
      event.preventDefault();
      actionRef.current?.onClick();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key]);
};
