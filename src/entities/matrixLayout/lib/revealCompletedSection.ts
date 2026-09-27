import { SECTION_TOGGLE_ATTRIBUTE } from './isSectionToggle';

/** Marks List view's Completed section */
export const COMPLETED_SECTION_ATTRIBUTE = 'data-completed-section';

/**
 * Brings the Completed section's top, its sticky header with it, under the
 * top bars at once and focuses the header's button. The section has to be
 * on the page already.
 */
export const revealCompletedSection = () => {
  const section = document.querySelector(`[${COMPLETED_SECTION_ATTRIBUTE}]`);
  if (!section) return;
  section.scrollIntoView({ block: 'start', behavior: 'instant' });
  section
    .querySelector<HTMLElement>(`[${SECTION_TOGGLE_ATTRIBUTE}]`)
    ?.focus({ preventScroll: true });
};
