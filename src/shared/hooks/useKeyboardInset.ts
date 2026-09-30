import { useEffect, useState } from 'react';

/**
 * How much of the window's bottom the on-screen keyboard covers, by
 * `visualViewport`: a panel pinned to the bottom sits that much higher, over
 * the keyboard. 0 when off or without `visualViewport`.
 */
export const useKeyboardInset = (isOn: boolean) => {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!isOn || !viewport) {
      setInset(0);
      return;
    }
    const update = () =>
      setInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, [isOn]);

  return inset;
};
