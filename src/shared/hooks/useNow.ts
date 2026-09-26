import { useSyncExternalStore } from 'react';

const MINUTE = 60_000;

// One clock for the whole page, not a timer per component: it ticks once a
// minute while anything reads it, and catches up when the tab is shown again
// after timers were throttled or the device slept
let now = new Date();
const listeners = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | undefined;

const tick = () => {
  now = new Date();
  listeners.forEach((listener) => listener());
};

const handleVisibility = () => {
  if (document.visibilityState === 'visible') tick();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    // The clock stood still while nothing read it
    now = new Date();
    interval = setInterval(tick, MINUTE);
    document.addEventListener('visibilitychange', handleVisibility);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    }
  };
};

const getNow = () => now;

/** The current time, updated once a minute and when the tab becomes visible */
export const useNow = () => useSyncExternalStore(subscribe, getNow, getNow);
