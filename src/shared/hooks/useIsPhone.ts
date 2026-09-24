import { useMediaQuery } from './useMediaQuery';

/** Narrower than Tailwind's sm (640px): the phone layout of the matrix */
export const useIsPhone = () => useMediaQuery('(max-width: 639px)');
