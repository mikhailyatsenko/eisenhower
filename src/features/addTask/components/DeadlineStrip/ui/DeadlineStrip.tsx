import { RefObject, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import {
  DeadlineChips,
  DeadlineDateFields,
  DeadlineInput,
  DeadlineKeyHint,
  deadlineByKey,
  toDeadline,
  toDeadlineInput,
} from '@/entities/matrixLayout';
import {
  useIsPhone,
  useIsTouchScreen,
  useKeyboardInset,
  useNow,
} from '@/shared/hooks';
import { formatDate } from '@/shared/lib/formatDate';
import { isTextField } from '@/shared/lib/isTextField';
import { Deadline } from '@/shared/stores/tasksStore';
import { useToastClearance } from '@/shared/ui/toast';
import { STRIP_STYLES } from '../consts';
import { sameDeadline, stripFirstFocusable } from '../lib';

interface DeadlineStripProps {
  stripRef: RefObject<HTMLDivElement | null>;
  /** The quadrant's title: whose new task the deadline is for */
  quadrantTitle: string;
  deadline: Deadline | null;
  /** The field has text: Add, and Enter in the date or time field, add it */
  canAdd: boolean;
  /** A chip: the deadline is set, the focus goes back to the field */
  onPick: (deadline: Deadline | null) => void;
  /** The date or time as it changes: the focus stays in the field changed */
  onChange: (deadline: Deadline | null) => void;
  onAdd: () => void;
  /** Esc, and Shift+Tab from the strip's first element: back to the field */
  onBack: () => void;
  /** "×": no task after all, the field closes as on Esc in it */
  onCancel: () => void;
  /** The focus has left the strip for somewhere else than the field */
  onLeave: (next: EventTarget | null) => void;
}

/**
 * The deadline of the task being typed in the inline add field, in place of
 * the action panel at the bottom: the chips (T, M, W, X, Del), a date with
 * "+ Time", and Add. All apply at once, with no Set. On a phone it sits over
 * the on-screen keyboard, Add in its top line, and starts folded to that
 * line: the chips and the date take half the screen left above the keyboard.
 * Its title unfolds them, a chip folds them back. The page's keys stay out.
 */
export const DeadlineStrip = ({
  stripRef,
  quadrantTitle,
  deadline,
  canAdd,
  onPick,
  onChange,
  onAdd,
  onBack,
  onCancel,
  onLeave,
}: DeadlineStripProps) => {
  const now = useNow();
  const isPhone = useIsPhone();
  // Judged by the primary pointer, like the panel: no key hints on touch
  const isTouchScreen = useIsTouchScreen();
  const keyboardInset = useKeyboardInset(isPhone);
  useToastClearance(stripRef);
  const [isUnfolded, setIsUnfolded] = useState(false);
  const choicesId = useId();
  const pick = (picked: Deadline | null) => {
    setIsUnfolded(false);
    onPick(picked);
  };

  // What the date and time fields hold, a time being typed too; a chip, an
  // add or a move puts the deadline in them
  const deadlineInput = toDeadlineInput(deadline ?? {});
  const [input, setInput] = useState<DeadlineInput>(deadlineInput);
  if (!sameDeadline(deadline, toDeadline(input))) setInput(deadlineInput);

  const changeInput = (next: DeadlineInput) => {
    setInput(next);
    const nextDeadline = toDeadline(next);
    if (nextDeadline !== undefined) onChange(nextDeadline);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // The matrix keys and Undo stay out, as in the panel's choices
    event.stopPropagation();
    const { key, target } = event;
    if (key === 'Escape') {
      event.preventDefault();
      onBack();
    } else if (
      key === 'Tab' &&
      event.shiftKey &&
      target === stripFirstFocusable(stripRef.current)
    ) {
      event.preventDefault();
      onBack();
    } else if (isTextField(target)) {
      // The date and time fields type their own keys, Enter adds
      if (key === 'Enter' && !event.nativeEvent.isComposing) {
        event.preventDefault();
        if (canAdd) onAdd();
      }
    } else if (
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.repeat
    ) {
      const picked = deadlineByKey(event.nativeEvent, now);
      if (picked === undefined) return;
      event.preventDefault();
      pick(picked);
    }
  };

  const addButton = (
    <button
      type="button"
      disabled={!canAdd}
      onClick={onAdd}
      className={STRIP_STYLES.ADD_BUTTON}
    >
      {deadline
        ? `Add · ${formatDate(deadline.dueDate, { hasTime: deadline.hasDueTime, now })}`
        : 'Add without deadline'}
      {!isTouchScreen && <DeadlineKeyHint label="Enter" />}
    </button>
  );
  // Named for what it does: the strip only follows the field
  const cancelButton = (
    <button
      type="button"
      aria-label="Cancel adding"
      onClick={onCancel}
      className={
        isPhone ? STRIP_STYLES.CANCEL_BADGE : STRIP_STYLES.CANCEL_BUTTON
      }
    >
      {/* An icon, not the × glyph: the glyph sits low in its line */}
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  );
  const choices = (
    <>
      <DeadlineChips current={deadlineInput} onPick={pick} phoneLayout="rows" />
      <div className="flex items-center gap-2">
        <DeadlineDateFields
          value={input}
          onChange={changeInput}
          isDateLabelShown={false}
          isTimeAlwaysOffered
        />
      </div>
    </>
  );

  return createPortal(
    <div
      ref={stripRef}
      role="group"
      aria-label={`Deadline for the new task in ${quadrantTitle}`}
      style={isPhone ? { bottom: keyboardInset } : undefined}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!stripRef.current?.contains(event.relatedTarget)) {
          onLeave(event.relatedTarget);
        }
      }}
      // A press on the strip leaves the focus where it is, in the field
      // too: the phone keeps its keyboard up. The date and time take it.
      onMouseDown={(event) => {
        event.stopPropagation();
        if (!isTextField(event.target)) event.preventDefault();
      }}
      // Not a click on the quadrant, which the strip belongs to in React
      onClick={(event) => event.stopPropagation()}
      className={isPhone ? STRIP_STYLES.PHONE : STRIP_STYLES.DESKTOP}
    >
      {isPhone ? (
        <>
          {/* × on the strip's top left corner, away from Add */}
          {cancelButton}
          {/* Add above the chips, out of the keyboard's way. Deadline starts
              past the ×'s 44px target, so a tap can't land on both. */}
          <div className="flex items-center gap-2 pl-10">
            <button
              type="button"
              aria-expanded={isUnfolded}
              aria-controls={choicesId}
              onClick={() => setIsUnfolded(!isUnfolded)}
              className={STRIP_STYLES.FOLD_BUTTON}
            >
              Deadline
              <svg
                aria-hidden="true"
                className={twMerge(
                  'size-4 shrink-0 transition-transform motion-reduce:transition-none',
                  isUnfolded && 'rotate-90',
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 6 6 6-6 6"
                />
              </svg>
            </button>
            <div className="ml-auto">{addButton}</div>
          </div>
          {isUnfolded && (
            <div id={choicesId} className="mt-2 flex flex-col gap-2">
              {choices}
            </div>
          )}
        </>
      ) : (
        <>
          {/* In place of a "Deadline" label, on the far side from Add */}
          {cancelButton}
          {choices}
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-white/20" />
          {addButton}
        </>
      )}
    </div>,
    // Out of the quadrant, whose animations would pin it there, and still
    // in the page's main landmark
    document.querySelector('main') ?? document.body,
  );
};
