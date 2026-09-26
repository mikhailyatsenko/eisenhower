/** Marks a List view section's collapse button */
export const SECTION_TOGGLE_ATTRIBUTE = 'data-section-toggle';

/** Whether the element is a section's collapse button, which keeps its keys */
export const isSectionToggle = (element: EventTarget | null) =>
  element instanceof Element && element.hasAttribute(SECTION_TOGGLE_ATTRIBUTE);
