import { useId, useLayoutEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { MAX_TASK_LENGTH, TASK_LENGTH_COUNTER_FROM } from '@/shared/consts';
import { useIsPhone, useIsTouchScreen } from '@/shared/hooks';
import { Task } from '@/shared/stores/tasksStore';
import { setTextEditDraftAction, useUIStore } from '@/shared/stores/uiStore';
import { singleLineText } from '../../../lib';
import { PANEL_STYLES, PRIMARY_BUTTON } from '../consts';

interface TextEditPanelProps {
  task: Pick<Task, 'text'>;
  /** Enter and Save: the text trimmed, never empty */
  onSave: (text: string) => void;
  /** "← Back" and Esc: nothing changes */
  onBack: () => void;
}

const EMPTY_TEXT_ERROR = 'A task needs some text';

/** The key that does the button's action, on desktop only */
const KeyHint = ({ label }: { label: string }) => (
  <kbd
    aria-hidden="true"
    className="ml-1.5 rounded border border-white/30 px-1 font-sans text-xs text-gray-300"
  >
    {label}
  </kbd>
);

/**
 * The task's text field the action panel turns into: "← Back", the field
 * and Save in one row on desktop; on a phone Back, "Edit text" and Save over
 * the field, out of the keyboard's way. The text is one line of at most 200
 * characters, with a counter near the end. The card shows the draft.
 */
export const TextEditPanel = ({ task, onSave, onBack }: TextEditPanelProps) => {
  const draft = useUIStore((state) => state.textEdit?.draft ?? '');
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const isPhone = useIsPhone();
  // Judged by the primary pointer, like the panel: no key hints on touch
  const isTouchScreen = useIsTouchScreen();
  const styles = isPhone ? PANEL_STYLES.phone : PANEL_STYLES.desktop;
  const errorId = useId();
  const counterId = useId();
  // Shown by Save or Enter, gone as soon as the text changes
  const [isErrorShown, setIsErrorShown] = useState(false);
  const hasCounter = draft.length >= TASK_LENGTH_COUNTER_FROM;

  // Before the panel's own effects: the focus never drops to the page
  useLayoutEffect(() => {
    fieldRef.current?.focus({ preventScroll: true });
    fieldRef.current?.select();
  }, []);

  // The field grows with the text, up to max-h-40, then scrolls
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.style.height = 'auto';
    field.style.height = `${field.scrollHeight}px`;
  }, [draft]);

  const save = () => {
    const text = draft.trim();
    if (!text) {
      setIsErrorShown(true);
      fieldRef.current?.focus();
      return;
    }
    onSave(text);
  };

  const hint = (label: string) => !isTouchScreen && <KeyHint label={label} />;

  const backButton = (
    <button
      type="button"
      aria-keyshortcuts="Escape"
      onClick={onBack}
      className={twMerge(styles.BUTTON, 'flex shrink-0 items-center')}
    >
      <span aria-hidden="true">←&nbsp;</span>Back
      {hint('Esc')}
    </button>
  );
  const saveButton = (
    <button
      type="button"
      onClick={save}
      className={twMerge(
        styles.BUTTON,
        PRIMARY_BUTTON,
        'flex shrink-0 items-center',
      )}
    >
      Save
      {hint('Enter')}
    </button>
  );
  const describedBy = [isErrorShown && errorId, hasCounter && counterId]
    .filter(Boolean)
    .join(' ');
  const field = (
    <textarea
      ref={fieldRef}
      rows={1}
      aria-label="Task text"
      aria-invalid={isErrorShown || undefined}
      aria-describedby={describedBy || undefined}
      value={draft}
      maxLength={MAX_TASK_LENGTH}
      enterKeyHint="done"
      onChange={(event) => {
        setIsErrorShown(false);
        setTextEditDraftAction(singleLineText(event.target.value));
      }}
      onKeyDown={(event) => {
        // One line: Enter saves, and with Shift it doesn't break the line either
        if (event.key !== 'Enter') return;
        event.preventDefault();
        if (!event.shiftKey && !event.nativeEvent.isComposing) save();
      }}
      className={twMerge(
        'block max-h-40 w-full min-w-0 resize-none overflow-y-auto rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-300',
        isPhone ? 'text-base' : 'text-sm',
      )}
    />
  );
  // Tied to the field: read with it, the counter never on its own
  const status = (isErrorShown || hasCounter) && (
    <div className="flex items-center gap-2 px-1 text-xs">
      {isErrorShown && (
        <p id={errorId} role="alert" className="font-bold text-red-300">
          {EMPTY_TEXT_ERROR}
        </p>
      )}
      {hasCounter && (
        <span
          id={counterId}
          className={twMerge(
            'ml-auto text-gray-300 tabular-nums',
            draft.length >= MAX_TASK_LENGTH && 'font-bold text-red-300',
          )}
        >
          {draft.length}/{MAX_TASK_LENGTH}
        </span>
      )}
    </div>
  );

  return (
    <div
      role="group"
      aria-label={`Edit text of “${task.text}”`}
      // Esc from the buttons too, not only from the field
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        onBack();
      }}
      className={
        isPhone
          ? 'flex flex-col gap-2'
          : 'flex items-start justify-center gap-2'
      }
    >
      {isPhone ? (
        <>
          {/* Save over the field: the keyboard can't cover it */}
          <div className="flex items-center justify-between gap-2">
            {backButton}
            <span aria-hidden="true" className="text-xs text-gray-300">
              Edit text
            </span>
            {saveButton}
          </div>
          {field}
          {status}
        </>
      ) : (
        <>
          {backButton}
          <div className="flex w-[min(40rem,calc(100vw-16rem))] flex-col gap-1">
            {field}
            {status}
          </div>
          {saveButton}
        </>
      )}
    </div>
  );
};
