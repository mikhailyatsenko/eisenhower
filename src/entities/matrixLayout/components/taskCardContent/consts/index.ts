import { CardLayout } from '../types';

interface CardLayoutClasses {
  /** The card box, over TASK_CARD_CLASS */
  card?: string;
  text: string;
  deadline?: string;
}

export const CARD_LAYOUT_CLASS: Record<CardLayout, CardLayoutClasses> = {
  // On a phone 12px and two lines at most; the full text is its name
  cell: {
    text: 'line-clamp-2 text-xs leading-tight sm:line-clamp-none sm:text-base sm:leading-5',
  },
  fullScreen: { text: 'text-sm leading-snug' },
  // From the left on every width
  row: {
    card: 'sm:text-left',
    text: 'text-sm leading-snug sm:text-base sm:leading-5',
    deadline: 'sm:justify-start',
  },
};

/** The card's text while it's edited in the action panel */
export const DRAFT_CLASS =
  'rounded outline-2 outline-offset-2 outline-gray-900 outline-dashed dark:outline-gray-100';
