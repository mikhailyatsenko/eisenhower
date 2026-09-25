import { useEffect } from 'react';
import { selectTaskAction, useUIStore } from '@/shared/stores/uiStore';
import { TOAST_CARD_SELECTOR } from '@/shared/ui/toast';

// What does its own thing on a click: a control, a task card, the action
// panel, the toast, a modal dialog with its backdrop (a click there may have
// closed it already). A quadrant's empty space has cleared it itself (G).
const OWN_CLICK = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  'summary',
  '[role="button"]',
  '[role="option"]',
  '[role="toolbar"]',
  'dialog',
  TOAST_CARD_SELECTOR,
].join(', ');

/**
 * A click or tap on any non-interactive place of the page clears the
 * selection: margins, gaps between quadrants, axis labels, the footer. The
 * focus stays where the browser puts it.
 */
export const useDeselectOnPageClick = () => {
  useEffect(() => {
    const handleClick = ({ target }: MouseEvent) => {
      if (useUIStore.getState().selectedTaskId === null) return;
      if (!(target instanceof Element) || target.closest(OWN_CLICK)) return;
      selectTaskAction(null);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
};
