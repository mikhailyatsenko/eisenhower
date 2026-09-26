import { useEffect, useId, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { useNow } from '@/shared/hooks';
import { DEADLINE_CHIPS, deadlineChipDate, deadlineStatus } from '../../../lib';
import { DeadlineLine } from '../../deadlineLine';
import { DEFAULT_TIME } from '../consts';
import { toDateValue, toDeadline } from '../lib';
import { DeadlineInput } from '../types';

interface DeadlineFieldsProps {
  value: DeadlineInput;
  onChange: (value: DeadlineInput) => void;
  /** The id of the error shown for an unreadable date or time */
  errorId?: string;
}

// A chip keeps the focus where it was on press: in the text field for a mouse
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

const LABEL_CLASS =
  'text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400';
// 44px high on a phone
const FIELD_CLASS =
  'min-h-11 rounded-md border border-gray-300 bg-white/50 px-2 text-base text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:min-h-9 sm:text-sm dark:[color-scheme:dark] dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-100';
const LINK_BUTTON_CLASS =
  'min-h-11 cursor-pointer rounded-md px-2 text-xs font-bold text-indigo-700 underline hover:bg-black/5 sm:min-h-9 dark:text-indigo-300 dark:hover:bg-white/5';

const Chip = ({
  isPressed,
  onClick,
  children,
}: {
  isPressed: boolean;
  onClick: () => void;
  children: string;
}) => (
  <button
    type="button"
    aria-pressed={isPressed}
    onMouseDown={keepFocus}
    onClick={onClick}
    className={twMerge(
      'min-h-11 cursor-pointer rounded-full border px-3 text-xs font-bold transition-colors sm:min-h-8',
      isPressed
        ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-400 dark:bg-indigo-400 dark:text-gray-900'
        : 'border-gray-500/40 bg-white/40 text-gray-800 hover:bg-white/70 dark:bg-gray-800/40 dark:text-gray-100 dark:hover:bg-gray-800/70',
    )}
  >
    {children}
  </button>
);

/**
 * The deadline of the task form: whole-day chips, a native date field, an
 * optional time and how the card will show it
 */
export const DeadlineFields = ({
  value,
  onChange,
  errorId,
}: DeadlineFieldsProps) => {
  const now = useNow();
  const labelId = useId();
  const dateId = useId();
  const timeId = useId();
  const timeRef = useRef<HTMLInputElement>(null);
  const addTimeRef = useRef<HTMLButtonElement>(null);

  // The time field opens or closes on a button press, the focus follows it
  const focusTargetAfterToggle = useRef<'time' | 'addTime' | null>(null);
  const isTimeOpen = value.time !== null;
  useEffect(() => {
    const target = focusTargetAfterToggle.current;
    focusTargetAfterToggle.current = null;
    if (target === 'time') timeRef.current?.focus();
    if (target === 'addTime') addTimeRef.current?.focus();
  }, [isTimeOpen]);

  const deadline = toDeadline(value);
  const errorProps = errorId
    ? { 'aria-invalid': true, 'aria-describedby': errorId }
    : {};

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <span id={labelId} className={LABEL_CLASS}>
        Deadline
      </span>

      <div className="flex flex-wrap gap-2">
        <Chip
          isPressed={!value.date}
          onClick={() => onChange({ date: '', time: null })}
        >
          No deadline
        </Chip>
        {DEADLINE_CHIPS.map((chip) => {
          const date = toDateValue(deadlineChipDate(chip, now));
          return (
            <Chip
              key={chip}
              // An open time field, even an emptied one, isn't a whole day
              isPressed={value.time === null && value.date === date}
              onClick={() => onChange({ date, time: null })}
            >
              {chip}
            </Chip>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label htmlFor={dateId} className={LABEL_CLASS}>
            Date
          </label>
          <input
            id={dateId}
            type="date"
            value={value.date}
            // Without a date there is no time
            onChange={(e) =>
              onChange({
                date: e.target.value,
                time: e.target.value ? value.time : null,
              })
            }
            className={FIELD_CLASS}
            {...errorProps}
          />
        </div>

        {isTimeOpen ? (
          <div className="flex items-end gap-1">
            <div className="flex flex-col">
              <label htmlFor={timeId} className={LABEL_CLASS}>
                Time
              </label>
              <input
                ref={timeRef}
                id={timeId}
                type="time"
                value={value.time ?? ''}
                onChange={(e) => onChange({ ...value, time: e.target.value })}
                className={FIELD_CLASS}
                {...errorProps}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                focusTargetAfterToggle.current = 'addTime';
                onChange({ ...value, time: null });
              }}
              className={LINK_BUTTON_CLASS}
            >
              Remove time
            </button>
          </div>
        ) : (
          value.date && (
            <button
              ref={addTimeRef}
              type="button"
              onClick={() => {
                focusTargetAfterToggle.current = 'time';
                onChange({ ...value, time: DEFAULT_TIME });
              }}
              className={LINK_BUTTON_CLASS}
            >
              + Add time
            </button>
          )
        )}
      </div>

      {deadline && (
        <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-gray-700 dark:text-gray-300">
          Shows on card as:
          <DeadlineLine
            task={deadline}
            status={deadlineStatus(deadline.dueDate, deadline.hasDueTime, now)}
            className="mt-0 sm:justify-start"
          />
        </div>
      )}
    </div>
  );
};
