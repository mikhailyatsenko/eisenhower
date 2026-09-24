/** A modal <dialog> is open: it covers the page, so page keys leave it alone */
export const isDialogOpen = () =>
  document.querySelector('dialog[open]') !== null;
