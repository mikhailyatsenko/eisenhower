import { shortcutModifier } from './shortcutModifier';

export const matchesShortcut = (event: KeyboardEvent, key: string) => {
  const { flag, other } = shortcutModifier();
  if (!event[flag] || event[other] || event.altKey || event.shiftKey) {
    return false;
  }

  // Printable ASCII names the letter on any Latin layout, Dvorak included;
  // on others, like Cyrillic, the letter comes from the physical key
  return /^[\x20-\x7e]$/.test(event.key)
    ? event.key.toLowerCase() === key.toLowerCase()
    : event.code === `Key${key.toUpperCase()}`;
};
