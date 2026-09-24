interface MoreBelowButtonProps {
  count: number;
  onClick: () => void;
}

/**
 * "+N below ↓" at the bottom of an overflowing list. Out of the Tab order:
 * the keyboard scrolls the list by moving focus with the arrows. A press
 * doesn't take focus either, so focus doesn't drop to the body when the last
 * click scrolls to the end and the indicator goes. The halo after it makes the
 * tap target 44px tall.
 */
export const MoreBelowButton: React.FC<MoreBelowButtonProps> = ({
  count,
  onClick,
}) => (
  <button
    type="button"
    tabIndex={-1}
    aria-label={`${count} more task${count === 1 ? '' : 's'} below`}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className="absolute bottom-1 left-1/2 z-3 -translate-x-1/2 cursor-pointer rounded-full bg-gray-900 px-2.5 py-1 text-xs leading-4 font-semibold whitespace-nowrap text-white shadow after:absolute after:-inset-x-1 after:-inset-y-2.5 after:content-[''] dark:bg-gray-100 dark:text-gray-900"
  >
    +{count} below ↓
  </button>
);
