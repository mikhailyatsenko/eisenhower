'use client';

import { FocusEvent, PointerEvent, useState } from 'react';
import { useMediaQuery } from '@/shared/hooks';
import { TOAST_DURATION_MS } from '../consts';
import {
  useActionShortcut,
  useCountdown,
  useIsPageActive,
  useSwipeToDismiss,
} from '../hooks';
import { formatShortcut } from '../lib';
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
  // Judged by the primary pointer, not the width: no key hint on touch
  const isTouchScreen = useMediaQuery('(hover: none) and (pointer: coarse)');
  useActionShortcut(action);

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
      data-toast-card
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
      {/* The status region next to the card already announces it */}
      <span aria-hidden="true">{message}</span>
      {action && (
        <span className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={action.onClick}
            className="min-h-11 min-w-11 cursor-pointer rounded-md px-3 font-bold text-[#ffa894] hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#ffa894] focus-visible:outline-none"
          >
            {action.label}
          </button>
          {action.shortcutKey && !isTouchScreen && (
            <kbd
              aria-hidden="true"
              className="mr-2 rounded border border-white/30 px-1.5 py-0.5 font-sans text-xs text-gray-300"
            >
              {formatShortcut(action.shortcutKey)}
            </kbd>
          )}
        </span>
      )}
    </div>
  );
};
