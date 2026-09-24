const APPLE = { symbol: '⌘', flag: 'metaKey', other: 'ctrlKey' } as const;
const OTHERS = { symbol: 'Ctrl+', flag: 'ctrlKey', other: 'metaKey' } as const;

/** Cmd is the shortcut modifier on Apple platforms (iPadOS reports a Mac), Ctrl elsewhere */
export const shortcutModifier = () =>
  /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? APPLE : OTHERS;
