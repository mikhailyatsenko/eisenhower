import { useEffect } from 'react';
import { isTextField } from '@/shared/lib/isTextField';
import { selectTaskAction } from '@/shared/stores/uiStore';

/** Escape clears the selection, unless it's meant for a text field or a dialog */
export const useClearSelectionOnEscape = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isTextField(event.target)) return;
      // Both the current modal and a native <dialog> opened with showModal()
      if (document.querySelector('[aria-modal="true"], dialog[open]')) return;
      selectTaskAction(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
};
