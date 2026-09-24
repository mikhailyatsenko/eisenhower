import { shortcutModifier } from './shortcutModifier';

/** How the shortcut reads, e.g. "⌘Z" or "Ctrl+Z" */
export const formatShortcut = (key: string) =>
  `${shortcutModifier().symbol}${key.toUpperCase()}`;
