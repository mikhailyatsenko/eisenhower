/** The key that picks a choice, on desktop only; in the chip's own colour, pressed or not */
export const DeadlineKeyHint = ({ label }: { label: string }) => (
  <kbd
    aria-hidden="true"
    className="ml-1.5 rounded border border-current px-1 font-sans text-[10px] font-normal opacity-70"
  >
    {label}
  </kbd>
);
