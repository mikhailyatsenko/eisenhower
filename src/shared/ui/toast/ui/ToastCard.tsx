'use client';

import { FocusEvent, PointerEvent, useState } from 'react';
import { TOAST_DURATION_MS } from '../consts';
import { useCountdown, useIsPageActive, useSwipeToDismiss } from '../hooks';
import { dismissToast, type Toast } from '../model';

interface ToastCardProps {
  toast: Toast;
}

export const ToastCard = ({ toast }: ToastCardProps) => {
  const { id, message, action } = toast;
  const dismiss = () => dismissToast(id);

  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const isPageActive = useIsPageActive();
  const { offset, isTouching, handlers } = useSwipeToDismiss(dismiss);

  useCountdown(
    TOAST_DURATION_MS,
    isHovered || hasFocus || isTouching || !isPageActive,
    dismiss,
  );

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setHasFocus(false);
  };

  return (
    <div
      className="motion-safe:animate-toast-slide-in motion-reduce:animate-toast-fade-in pointer-events-auto flex min-h-12 max-w-full touch-pan-y items-center gap-4 rounded-lg bg-gray-900 py-1 pr-1 pl-4 text-sm font-medium text-white shadow-lg dark:bg-gray-700"
      style={
        offset
          ? {
              transform: `translateX(${offset}px)`,
              opacity: Math.max(0, 1 - Math.abs(offset) / 200),
            }
          : undefined
      }
      // A tap emulates mouseenter without mouseleave, so only a mouse hovers
      onPointerEnter={(e: PointerEvent) =>
        setIsHovered(e.pointerType === 'mouse')
      }
      onPointerLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={handleBlur}
      {...handlers}
    >
      <span>{message}</span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="min-h-11 min-w-11 shrink-0 cursor-pointer rounded-md px-3 font-bold text-[#ffa894] hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#ffa894] focus-visible:outline-none"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
