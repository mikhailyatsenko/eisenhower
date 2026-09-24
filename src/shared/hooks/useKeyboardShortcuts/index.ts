import { useEffect } from 'react';
import { MATRIX_KEYS, QUADRANTS } from '@/shared/consts';
import { isTextField } from '@/shared/lib/isTextField';
import { openFormWithCategoryAction } from '@/shared/stores/uiStore';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextField(event.target)) return;

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
