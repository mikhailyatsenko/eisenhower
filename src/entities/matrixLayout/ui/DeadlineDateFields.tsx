import { useEffect, useId, useRef } from 'react';
import { useNow } from '@/shared/hooks';
import { DEFAULT_TIME } from '../consts';
import { toDateValue } from '../lib';
import { DeadlineInput } from '../types';

interface DeadlineDateFieldsProps {
  value: DeadlineInput;
  onChange: (value: DeadlineInput) => void;
  /** "Date" shows over the field; else it's for screen readers only */
  isDateLabelShown: boolean;
  /** "+ Time" shows without a date too, and then sets today */
  isTimeAlwaysOffered?: boolean;
}

// Every target is at least 44×44 on a phone
const FIELD =
  'min-h-11 rounded-md border border-white/25 bg-white/10 px-2 text-base text-white [color-scheme:dark] focus:ring-2 focus:ring-indigo-300 focus:outline-none sm:min-h-9 sm:text-sm';
const LABEL = 'text-[10px] font-bold tracking-wider text-gray-300 uppercase';
const TIME_BUTTON =
  'flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-bold whitespace-nowrap underline hover:bg-white/10 sm:min-h-9';

/**
 * The date field of the deadline choices, and "+ Time", which opens a time
 * field at 9:00 and hands the focus to it. Without a date there is no time.
 */
export const DeadlineDateFields = ({
  value,
  onChange,
  isDateLabelShown,
  isTimeAlwaysOffered = false,
}: DeadlineDateFieldsProps) => {
  const now = useNow();
  const dateId = useId();
  const timeRef = useRef<HTMLInputElement>(null);

  // "+ Time" hands the focus to the time field it opens
  const isTimeOpen = value.time !== null;
  const shouldFocusTime = useRef(false);
  useEffect(() => {
    if (isTimeOpen && shouldFocusTime.current) timeRef.current?.focus();
    shouldFocusTime.current = false;
  }, [isTimeOpen]);

  return (
    <>
      <div className="flex flex-col">
        {/* A date field reads as a date: the label may be for screen readers only */}
        <label
          htmlFor={dateId}
          className={isDateLabelShown ? LABEL : 'sr-only'}
        >
          Date
        </label>
        <input
          id={dateId}
          type="date"
          value={value.date}
          onChange={(event) =>
            onChange({
              date: event.target.value,
              time: event.target.value ? value.time : null,
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
          value={value.time ?? ''}
          onChange={(event) => onChange({ ...value, time: event.target.value })}
          className={FIELD}
        />
      ) : (
        (value.date || isTimeAlwaysOffered) && (
          <button
            type="button"
            onClick={() => {
              shouldFocusTime.current = true;
              onChange({
                date: value.date || toDateValue(now),
                time: DEFAULT_TIME,
              });
            }}
            className={TIME_BUTTON}
          >
            + Time
          </button>
        )
      )}
    </>
  );
};
