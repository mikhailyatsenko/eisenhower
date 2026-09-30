/** The key that does the button's action right now, on desktop only */
export const KeyHint = ({ label }: { label: string }) => (
  <kbd
    aria-hidden="true"
    className="ml-1.5 rounded border border-white/30 px-1 font-sans text-xs text-gray-300"
  >
    {label}
  </kbd>
);
