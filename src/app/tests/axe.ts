import { configureAxe } from 'jest-axe';

/**
 * Violations already known from the UI/UX audit, by axe rule, each signed
 * with its finding code. The slice that fixes a finding removes its rules;
 * any other violation fails the check.
 */
export const KNOWN_VIOLATIONS: Record<string, string> = {
  // X1: a header button has no accessible name (the theme toggle)
  'button-name': 'X1',
  // X2: the task card is a dnd-kit role="button" with buttons and links inside
  'nested-interactive': 'X2',
  // X2: role="button" isn't allowed on the card's <li>
  'aria-allowed-role': 'X2',
  // X2: with role="button" the cards stop being list items of the quadrant <ul>
  list: 'X2',
};

export const axe = configureAxe({
  rules: Object.fromEntries(
    Object.keys(KNOWN_VIOLATIONS).map((rule) => [rule, { enabled: false }]),
  ),
});
