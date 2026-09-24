import { configureAxe } from 'jest-axe';

interface KnownViolation {
  /** Finding code from the UI/UX audit */
  finding: string;
  /** How many elements may break the rule; omitted means any number */
  nodes?: number;
}

/**
 * Violations already known from the UI/UX audit, by axe rule. The slice that
 * fixes a finding removes its rules; any other violation fails the check.
 */
export const KNOWN_VIOLATIONS: Record<string, KnownViolation> = {
  // X1: the theme toggle has no accessible name; slice L (R3) names it.
  'button-name': { finding: 'X1', nodes: 1 },
  // X2: the task card is a dnd-kit role="button" with buttons and links inside
  'nested-interactive': { finding: 'X2' },
  // X2: role="button" isn't allowed on the card's <li>
  'aria-allowed-role': { finding: 'X2' },
  // X2: with role="button" the cards stop being list items of the quadrant <ul>
  list: { finding: 'X2' },
};

const runAxe = configureAxe();

type Violation = Awaited<ReturnType<typeof runAxe>>['violations'][number];

const isKnown = ({ id, nodes }: Violation) => {
  const known = KNOWN_VIOLATIONS[id];
  return known !== undefined && nodes.length <= (known.nodes ?? Infinity);
};

/** Runs every axe rule and reports only violations beyond the known ones */
export const axe = async (element: Element) => {
  const results = await runAxe(element);
  return {
    ...results,
    violations: results.violations.filter((violation) => !isKnown(violation)),
  };
};

/** Every violation, known ones included */
export const axeWithAllRules = (element: Element) => runAxe(element);
