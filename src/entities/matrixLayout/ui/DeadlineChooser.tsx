import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useIsPhone, useIsTouchScreen, useNow } from '@/shared/hooks';
import { isTextField } from '@/shared/lib/isTextField';
import { Deadline, Task } from '@/shared/stores/tasksStore';
import { deadlineByKey, toDeadline, toDeadlineInput } from '../lib';
import { DeadlineInput } from '../types';
import { DeadlineChips } from './DeadlineChips';
import { DeadlineDateFields } from './DeadlineDateFields';
import { DeadlineKeyHint } from './DeadlineKeyHint';

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

/**
 * The deadline choices the action panel turns into: "← Back", whole-day
 * chips that save at once (M, W, X, Del for none), then a date with an
 * optional time that saves on Set or Enter. One row on desktop; on a phone
 * the chips sit in a row of three with their dates. The page's keys stay
 * out of it.
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

  // The keys work wherever the focus is while choosing: first on the page,
  // before the matrix keys (C, E, 1–4, N, ?) and Undo, which they keep out
  const keysRef = useRef({ onPick, onBack, now });
  useEffect(() => {
    keysRef.current = { onPick, onBack, now };
  });
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const keys = keysRef.current;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        keys.onBack();
        return;
      }
      // A field types its letters and edits with Delete and Backspace
      if (isTextField(event.target)) return;
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat)
        return;
      const deadline = deadlineByKey(event, keys.now);
      if (deadline === undefined) return;
      event.preventDefault();
      keys.onPick(deadline);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

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
      <DeadlineDateFields
        value={customInput}
        onChange={setCustomInput}
        isDateLabelShown={isPhone}
      />
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
      {!isTouchScreen && <DeadlineKeyHint label="Esc" />}
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
      <DeadlineChips current={savedInput} onPick={onPick} phoneLayout="grid" />
      {customForm}
    </div>
  );
};
