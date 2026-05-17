import { useEffect } from 'react';
import { MatrixKey } from '@/shared/stores/tasksStore';
import {
  openFormWithCategoryAction,
  useUIStore,
  setIsAnalyticsOpenedAction,
} from '@/shared/stores/uiStore';

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
      if (
        event.key === '1' ||
        event.key === '2' ||
        event.key === '3' ||
        event.key === '4'
      ) {
        event.preventDefault(); // Fix Firefox search trigger
        if (event.key === '1')
          openFormWithCategoryAction('ImportantUrgent' as MatrixKey);
        if (event.key === '2')
          openFormWithCategoryAction('ImportantNotUrgent' as MatrixKey);
        if (event.key === '3')
          openFormWithCategoryAction('NotImportantUrgent' as MatrixKey);
        if (event.key === '4')
          openFormWithCategoryAction('NotImportantNotUrgent' as MatrixKey);
      }

      // Alt + S to toggle analytics
      if (event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        const { isAnalyticsOpened } = useUIStore.getState();
        setIsAnalyticsOpenedAction(!isAnalyticsOpened);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
