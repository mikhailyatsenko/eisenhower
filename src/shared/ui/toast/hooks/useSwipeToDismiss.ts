import { PointerEvent, useState } from 'react';
import { SWIPE_DISMISS_PX } from '../consts';

/** Sideways swipe on touch screens; mouse and pen don't drag the toast */
export const useSwipeToDismiss = (onDismiss: () => void) => {
  const [startX, setStartX] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);

  const reset = () => {
    setStartX(null);
    setOffset(0);
  };

  const handlers = {
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType === 'touch') setStartX(e.clientX);
    },
    onPointerMove: (e: PointerEvent) => {
      if (startX !== null) setOffset(e.clientX - startX);
    },
    onPointerUp: () => {
      if (startX === null) return;
      if (Math.abs(offset) > SWIPE_DISMISS_PX) onDismiss();
      reset();
    },
    onPointerCancel: reset,
  };

  return { offset, isTouching: startX !== null, handlers };
};
