import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  DEADLINE_CHIPS,
  DEADLINE_CHIP_KEYS,
  DeadlineChip,
  NO_DEADLINE,
} from '@/shared/consts';
import { useIsPhone, useIsTouchScreen, useNow } from '@/shared/hooks';
import { formatDate } from '@/shared/lib/formatDate';
import { isTextField } from '@/shared/lib/isTextField';
import { keyLetter } from '@/shared/lib/keyLetter';
import { Deadline, Task } from '@/shared/stores/tasksStore';
import { DEFAULT_TIME } from '../consts';
import {
  deadlineChipDate,
  toDateValue,
  toDeadline,
  toDeadlineInput,
} from '../lib';
import { DeadlineInput } from '../types';

interface DeadlineChooserProps {
  task: Pick<Task, 'text' | 'dueDate' | 'hasDueTime'>;
  /** A chip, Set or Enter: the deadline to write, null for none */
  onPick: (deadline: Deadline | null) => void;
  /** "← Back" and Esc: nothing changes */
  onBack: () => void;
}

// Every target is at least 44×44 on a phone
const BUTTON =
  'flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-3 hover:bg-white/10 sm:min-h-9';
const FIELD =
  'min-h-11 rounded-md border border-white/25 bg-white/10 px-2 text-base text-white [color-scheme:dark] focus:ring-2 focus:ring-indigo-300 focus:outline-none sm:min-h-9 sm:text-sm';
const LABEL = 'text-[10px] font-bold tracking-wider text-gray-300 uppercase';

const CHIP_BUTTON = {
  base: 'flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-3 text-xs font-bold whitespace-nowrap sm:min-h-8',
  pressed: 'border-indigo-200 bg-indigo-200 text-gray-900',
  idle: 'border-white/30 bg-white/5 text-white hover:bg-white/15',
  // Two lines on a phone: the name, the date under it
  phone: 'min-h-11 flex-col rounded-lg py-1 leading-tight',
};

/** The key that picks a choice, on desktop only; in the chip's own colour, pressed or not */
const KeyHint = ({ label }: { label: string }) => (
  <kbd
    aria-hidden="true"
    className="ml-1.5 rounded border border-current px-1 font-sans text-[10px] font-normal opacity-70"
  >
    {label}
  </kbd>
);

/**
 * The deadline choices the action panel turns into: "← Back", whole-day
 * chips that save at once (T, M, W, X, Del for none), then a date with an
 * optional time that saves on Set or Enter. One row on desktop; on a phone
 * the chips sit 2×2 with their dates. The page's keys stay out of it.
 */
export const DeadlineChooser = ({
  task,
  onPick,
  onBack,
}: DeadlineChooserProps) => {
  const now = useNow();
  const isPhone = useIsPhone();
  // Judged by the primary pointer, like the panel: no key hints on touch
  const isTouchScreen = useIsTouchScreen();
  const rootRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const dateId = useId();
  const savedInput = toDeadlineInput(task);
  const [customInput, setCustomInput] = useState<DeadlineInput>(savedInput);
  const customDeadline = toDeadline(customInput);

  // Before the panel's own effects: the focus never drops to the page
  useLayoutEffect(() => {
    const chips = rootRef.current?.querySelectorAll<HTMLElement>(
      'button[aria-pressed]',
    );
    const pressed = [...(chips ?? [])].find(
      (chip) => chip.getAttribute('aria-pressed') === 'true',
    );
    (pressed ?? chips?.[0])?.focus();
  }, []);

  // "+ Time" hands the focus to the time field it opens
  const isTimeOpen = customInput.time !== null;
  const shouldFocusTime = useRef(false);
  useEffect(() => {
    if (isTimeOpen && shouldFocusTime.current) timeRef.current?.focus();
    shouldFocusTime.current = false;
  }, [isTimeOpen]);

  const chipDate = (chip: DeadlineChip) => deadlineChipDate(chip, now);
  const pickChip = (chip: DeadlineChip) =>
    onPick({ dueDate: chipDate(chip), hasDueTime: false });

  // The keys work wherever the focus is while choosing: first on the page,
  // before the matrix keys (C, E, 1–4, N, ?) and Undo, which they keep out
  const keysRef = useRef({ onPick, onBack, pickChip });
  useEffect(() => {
    keysRef.current = { onPick, onBack, pickChip };
  });
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const { key, target } = event;
      const keys = keysRef.current;
      if (key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        keys.onBack();
        return;
      }
      // A field types its letters and edits with Delete and Backspace
      if (isTextField(target)) return;
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat)
        return;
      if (key === 'Delete' || key === 'Backspace') {
        event.preventDefault();
        keys.onPick(null);
        return;
      }
      const letter = keyLetter(event);
      const chip = DEADLINE_CHIPS.find(
        (deadlineChip) =>
          DEADLINE_CHIP_KEYS[deadlineChip].toLowerCase() === letter,
      );
      if (chip) {
        event.preventDefault();
        keys.pickChip(chip);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  const hint = (label: string) => !isTouchScreen && <KeyHint label={label} />;

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
      )}
    >
      {name}
      {/* Read as "Tomorrow Mon 28 Sept", not run together */}
      {isPhone && date && ' '}
      {isPhone && date && (
        <span className="text-[11px] font-normal">
          {formatDate(date, { hasTime: false, now })}
        </span>
      )}
      {hint(keyLabel)}
    </button>
  );

  const chips = DEADLINE_CHIPS.map((chip) =>
    chipButton(
      chip,
      // An own time isn't a whole day; one set before R4 has a time
      savedInput.time === null &&
        savedInput.date === toDateValue(chipDate(chip)),
      () => pickChip(chip),
      DEADLINE_CHIP_KEYS[chip],
      chipDate(chip),
    ),
  );
  const noDeadlineChip = chipButton(
    NO_DEADLINE,
    !savedInput.date,
    () => onPick(null),
    'Del',
  );

  const customForm = (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (customDeadline) onPick(customDeadline);
      }}
      className={twMerge(
        'flex flex-wrap items-center gap-2',
        isPhone && 'items-end',
      )}
    >
      <div className="flex flex-col">
        {/* A date field reads as a date on desktop: the label is for screen readers */}
        <label htmlFor={dateId} className={isPhone ? LABEL : 'sr-only'}>
          Date
        </label>
        <input
          id={dateId}
          type="date"
          value={customInput.date}
          // Without a date there is no time
          onChange={(event) =>
            setCustomInput({
              date: event.target.value,
              time: event.target.value ? customInput.time : null,
            })
          }
          className={FIELD}
        />
      </div>
      {isTimeOpen ? (
        <input
          ref={timeRef}
          type="time"
          aria-label="Time"
          value={customInput.time ?? ''}
          onChange={(event) =>
            setCustomInput({ ...customInput, time: event.target.value })
          }
          className={FIELD}
        />
      ) : (
        customInput.date && (
          <button
            type="button"
            onClick={() => {
              shouldFocusTime.current = true;
              setCustomInput({ ...customInput, time: DEFAULT_TIME });
            }}
            className={twMerge(BUTTON, 'text-xs font-bold underline')}
          >
            + Time
          </button>
        )
      )}
      <button
        type="submit"
        disabled={!customDeadline}
        className={twMerge(
          BUTTON,
          'bg-indigo-700 text-xs font-bold hover:bg-indigo-800 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-indigo-700',
        )}
      >
        Set
      </button>
    </form>
  );

  const backButton = (
    <button
      type="button"
      aria-keyshortcuts="Escape"
      onClick={onBack}
      className={twMerge(BUTTON, 'px-2 text-sm', isPhone && 'self-start')}
    >
      <span aria-hidden="true">←&nbsp;</span>Back
      {hint('Esc')}
    </button>
  );

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={`Deadline for “${task.text}”`}
      className={
        isPhone
          ? 'flex flex-col gap-3'
          : 'flex flex-wrap items-center justify-center gap-2'
      }
    >
      {backButton}
      {isPhone ? (
        <>
          <div className="grid grid-cols-2 gap-2">{chips}</div>
          {noDeadlineChip}
        </>
      ) : (
        <>
          {chips}
          {noDeadlineChip}
        </>
      )}
      {customForm}
    </div>
  );
};
