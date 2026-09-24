/**
 * jsdom 20 has <dialog> but no showModal() or close(). This stands in for the
 * browser: showModal() opens the dialog and focuses its first control, close()
 * fires `close` (right away; the browser queues it), and Escape on an open modal fires `cancel` and closes it once
 * the key event has run, unless a listener prevented it. The inert background
 * isn't emulated.
 */
const FOCUSABLE =
  'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const modals: HTMLDialogElement[] = [];

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    this.open = true;
  };

  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    if (this.open) {
      throw new DOMException('The dialog is already open', 'InvalidStateError');
    }
    this.open = true;
    modals.push(this);
    const target =
      this.querySelector<HTMLElement>('[autofocus]') ??
      this.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
  };

  HTMLDialogElement.prototype.close = function close(
    this: HTMLDialogElement,
    returnValue?: string,
  ) {
    if (!this.open) return;
    this.open = false;
    if (returnValue !== undefined) this.returnValue = returnValue;
    modals.splice(modals.indexOf(this), 1);
    this.dispatchEvent(new Event('close'));
  };

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const dialog = modals.at(-1);
    if (!dialog) return;
    // The browser acts after every listener has had the key
    queueMicrotask(() => {
      if (event.defaultPrevented || !dialog.open) return;
      const cancel = new Event('cancel', { cancelable: true });
      if (dialog.dispatchEvent(cancel)) dialog.close();
    });
  });
}
