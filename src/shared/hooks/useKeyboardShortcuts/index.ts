import { useEffect } from 'react';
import { MATRIX_KEYS, QUADRANTS } from '@/shared/consts';
import { openFormWithCategoryAction } from '@/shared/stores/uiStore';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in an input, textarea or contenteditable element
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // 1-4 keys to open add task modal in specific quadrant
      const quadrant = MATRIX_KEYS.find(
        (key) => QUADRANTS[key].shortcut === event.key,
      );
      if (quadrant) {
        event.preventDefault(); // Fix Firefox search trigger
        openFormWithCategoryAction(quadrant);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
