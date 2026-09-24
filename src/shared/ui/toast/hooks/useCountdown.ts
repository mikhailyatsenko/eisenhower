import { useEffect, useRef } from 'react';

/** Calls onDone after `duration` ms of unpaused time */
export const useCountdown = (
  duration: number,
  isPaused: boolean,
  onDone: () => void,
) => {
  const remaining = useRef(duration);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (isPaused) return;

    const startedAt = Date.now();
    const timer = setTimeout(() => onDoneRef.current(), remaining.current);

    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [isPaused]);
};
