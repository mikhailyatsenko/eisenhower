/** Text fields keep their own keys, like Ctrl+Z to undo typing */
export const isTextField = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable);
