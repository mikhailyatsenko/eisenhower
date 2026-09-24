import { ArrowKey } from '../types';

export const isArrowKey = (key: string): key is ArrowKey =>
  key === 'ArrowUp' ||
  key === 'ArrowDown' ||
  key === 'ArrowLeft' ||
  key === 'ArrowRight';
