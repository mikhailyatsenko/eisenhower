import { useIsTouchScreen } from '@/shared/hooks';

/**
 * The line under the matrix: how to select a task, and with a mouse the
 * arrows and ?. Plain text, so Undo stays the next Tab stop after the matrix.
 */
export const SelectionHint: React.FC = () => {
  const isTouchScreen = useIsTouchScreen();

  return (
    <p className="mt-4 text-center text-xs text-gray-700 dark:text-gray-300">
      {isTouchScreen
        ? 'Tap a task to select it'
        : 'Click a task to select it · ↑↓←→ move selection · ? all shortcuts'}
    </p>
  );
};
