import { RefObject, useEffect, useRef } from 'react';
import { requestTaskFocusAction } from '@/shared/stores/uiStore';

/**
 * Focus never drops to <body> from the matrix. When the focused element
 * leaves the page (a completed, deleted or moved task, the toolbar of a task
 * that's gone), focus goes to the task now selected or, with none, to the
 * matrix container.
 */
export const useFocusAfterAction = (
  matrixRef: RefObject<HTMLElement | null>,
  selectedTaskId: string | null,
) => {
  // Where the element was is only known while it's still on the page
  const lastFocused = useRef<{ element: Element; isInMatrix: boolean }>(null);

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const element = event.target as Element;
      lastFocused.current = {
        element,
        isInMatrix: matrixRef.current?.contains(element) ?? false,
      };
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [matrixRef]);

  // After every render: tasks and selection are what removes elements
  useEffect(() => {
    const last = lastFocused.current;
    if (!last?.isInMatrix || last.element.isConnected) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;

    lastFocused.current = null;
    if (selectedTaskId) requestTaskFocusAction(selectedTaskId);
    else matrixRef.current?.focus();
  });
};
