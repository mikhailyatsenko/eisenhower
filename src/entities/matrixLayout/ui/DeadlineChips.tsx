import { twMerge } from 'tailwind-merge';
import {
  DEADLINE_CHIPS,
  DEADLINE_CHIP_KEYS,
  DeadlineChip,
  NO_DEADLINE,
} from '@/shared/consts';
import { useIsPhone, useIsTouchScreen, useNow } from '@/shared/hooks';
import { formatDate } from '@/shared/lib/formatDate';
import { Deadline } from '@/shared/stores/tasksStore';
import { deadlineChipDate, toDateValue } from '../lib';
import { DeadlineInput } from '../types';
import { DeadlineKeyHint } from './DeadlineKeyHint';

interface DeadlineChipsProps {
  /** A chip is pressed for its whole day, No deadline without a date */
  current: DeadlineInput;
  /** A chip's whole day, null for No deadline */
  onPick: (deadline: Deadline | null) => void;
  /**
   * On a phone: 2×2 with the dates under the names and No deadline under
   * them, or all in wrapping rows, names only
   */
  phoneLayout: 'grid' | 'rows';
}

const CHIP_BUTTON = {
  base: 'flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-3 text-xs font-bold whitespace-nowrap sm:min-h-8',
  pressed: 'border-indigo-200 bg-indigo-200 text-gray-900',
  idle: 'border-white/30 bg-white/5 text-white hover:bg-white/15',
  // Every target is at least 44×44 on a phone
  phone: 'min-h-11 rounded-lg py-1 leading-tight',
  // Two lines: the name, the date under it
  withDate: 'flex-col',
};

/**
 * The deadline chips of the deadline choices, Today to Next week and No
 * deadline, with aria-pressed and their keys. On desktop they sit in the
 * row of the parent.
 */
export const DeadlineChips = ({
  current,
  onPick,
  phoneLayout,
}: DeadlineChipsProps) => {
  const now = useNow();
  const isPhone = useIsPhone();
  // Judged by the primary pointer, like the panel: no key hints on touch
  const isTouchScreen = useIsTouchScreen();
  const showsDates = isPhone && phoneLayout === 'grid';

  const chipDate = (chip: DeadlineChip) => deadlineChipDate(chip, now);

  const chipButton = (
    name: string,
    isPressed: boolean,
    onClick: () => void,
    keyLabel: string,
    date?: Date,
  ) => (
    <button
      key={name}
      type="button"
      aria-pressed={isPressed}
      onClick={onClick}
      className={twMerge(
        CHIP_BUTTON.base,
        isPressed ? CHIP_BUTTON.pressed : CHIP_BUTTON.idle,
        isPhone && CHIP_BUTTON.phone,
        showsDates && CHIP_BUTTON.withDate,
      )}
    >
      {name}
      {/* Read as "Tomorrow Mon 28 Sept", not run together */}
      {showsDates && date && ' '}
      {showsDates && date && (
        <span className="text-[11px] font-normal">
          {formatDate(date, { hasTime: false, now })}
        </span>
      )}
      {!isTouchScreen && <DeadlineKeyHint label={keyLabel} />}
    </button>
  );

  const chips = DEADLINE_CHIPS.map((chip) =>
    chipButton(
      chip,
      // An own time isn't a whole day; one set before R4 has a time
      current.time === null && current.date === toDateValue(chipDate(chip)),
      () => onPick({ dueDate: chipDate(chip), hasDueTime: false }),
      DEADLINE_CHIP_KEYS[chip],
      chipDate(chip),
    ),
  );
  const noDeadlineChip = chipButton(
    NO_DEADLINE,
    !current.date,
    () => onPick(null),
    'Del',
  );

  if (!isPhone) {
    return (
      <>
        {chips}
        {noDeadlineChip}
      </>
    );
  }
  if (phoneLayout === 'grid') {
    return (
      <>
        <div className="grid grid-cols-2 gap-2">{chips}</div>
        {noDeadlineChip}
      </>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {chips}
      {noDeadlineChip}
    </div>
  );
};
