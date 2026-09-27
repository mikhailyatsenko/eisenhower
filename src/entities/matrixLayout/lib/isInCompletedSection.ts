import { COMPLETED_SECTION_ATTRIBUTE } from './revealCompletedSection';

/** Whether the element is in List view's Completed section */
export const isInCompletedSection = (element: Element) =>
  element.closest(`[${COMPLETED_SECTION_ATTRIBUTE}]`) !== null;
