import { useMediaQuery } from './useMediaQuery';

/**
 * The primary pointer is a finger, not the width: a laptop with a touch
 * screen and a mouse gets the mouse wording
 */
export const useIsTouchScreen = () =>
  useMediaQuery('(hover: none) and (pointer: coarse)');
