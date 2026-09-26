import { useEffect, useId, useState, useRef } from 'react';
import { MATRIX_KEYS, QUADRANTS } from '@/shared/consts';
import { Deadline, Task, MatrixKey } from '@/shared/stores/tasksStore';
import { BUTTON_CANCEL_TEXT, BUTTON_SAVE_TEXT } from '../../consts';
import {
  DeadlineFields,
  DeadlineInput,
  toDeadlineInput,
  toDeadline,
} from '../deadlineFields';

interface EditFormProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  task: Task;
  handleSave: (
    editText: string,
    deadline: Deadline | null,
    newQuadrant?: MatrixKey,
  ) => void;
  onQuadrantChange?: (quadrant: MatrixKey) => void;
}

// Controls that hand the focus back to the text field keep it on press, so
// picking them isn't a blur that shows the length error
const keepTextFocus = (e: React.MouseEvent) => e.preventDefault();

const quadrantButtonStyles: Record<
  MatrixKey,
  { active: string; inactive: string }
> = {
  ImportantUrgent: {
    active: 'border-red-600 bg-red-500 text-white shadow-inner',
    inactive:
      'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300',
  },
  ImportantNotUrgent: {
    active: 'border-yellow-600 bg-yellow-500 text-white shadow-inner',
    inactive:
      'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-300',
  },
  NotImportantUrgent: {
    active: 'border-blue-600 bg-blue-500 text-white shadow-inner',
    inactive:
      'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300',
  },
  NotImportantNotUrgent: {
    active: 'border-green-600 bg-green-500 text-white shadow-inner',
    inactive:
      'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300',
  },
};

export const EditTaskForm: React.FC<EditFormProps> = ({
  setIsEditing,
  task,
  handleSave,
  onQuadrantChange,
}) => {
  const [editText, setEditText] = useState(task.text);
  const [deadlineInput, setDeadlineInput] = useState(() =>
    toDeadlineInput(task),
  );
  const [selectedQuadrant, setSelectedQuadrant] = useState<MatrixKey>(
    task.quadrantKey || 'NotImportantNotUrgent',
  );
  const [isValid, setIsValid] = useState(true);
  // The length error waits for the first blur or save attempt
  const [isTextTouched, setIsTextTouched] = useState(false);
  const showTextError = isTextTouched && !isValid;
  const [deadlineInvalid, setDeadlineInvalid] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quadrantIdPrefix = useId();
  const textId = useId();
  const textErrorId = useId();
  const deadlineErrorId = useId();
  const deadlineRef = useRef<HTMLDivElement>(null);

  // Any change of the deadline clears the error shown for the old one
  const changeDeadline = (input: DeadlineInput) => {
    setDeadlineInput(input);
    setDeadlineInvalid(false);
  };

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    setIsValid(editText.length > 0 && editText.length <= 200);
    autoResizeTextarea();
  }, [editText]);

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleQuadrantClick = (key: MatrixKey) => {
    setSelectedQuadrant(key);
    onQuadrantChange?.(key);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSave();
    }
  };

  const onSave = () => {
    setIsTextTouched(true);
    if (!isValid) return;

    // A half-typed date or time reads as empty, only the browser knows it's there
    const hasBadInput = [
      ...(deadlineRef.current?.querySelectorAll('input') ?? []),
    ].some((input) => input.validity.badInput);
    const deadline = toDeadline(deadlineInput);
    if (hasBadInput || deadline === undefined) {
      setDeadlineInvalid(true);
      return;
    }
    handleSave(editText, deadline, selectedQuadrant);
  };

  return (
    <form
      className="flex flex-1 flex-col overflow-hidden"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="scrollbar-hidden flex-1 overflow-y-auto px-1">
        <div className="mb-4 flex flex-col">
          <label
            htmlFor={textId}
            className="mb-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
          >
            Task Description
          </label>
          <textarea
            id={textId}
            ref={textareaRef}
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={() => setIsTextTouched(true)}
            onKeyDown={handleKeyDown}
            aria-invalid={showTextError ? 'true' : undefined}
            aria-describedby={showTextError ? textErrorId : undefined}
            className="min-h-[100px] w-full resize-none overflow-hidden rounded-md border border-gray-300 bg-white/50 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-100"
            placeholder="What needs to be done?"
          />
        </div>

        <div className="mb-4 flex flex-col">
          <label className="mb-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Quadrant
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MATRIX_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-labelledby={`${quadrantIdPrefix}-${key}-title`}
                aria-describedby={`${quadrantIdPrefix}-${key}-criteria`}
                onMouseDown={keepTextFocus}
                onClick={() => handleQuadrantClick(key)}
                className={`rounded-md border p-2 text-left text-[10px] font-bold transition-all ${
                  selectedQuadrant === key
                    ? quadrantButtonStyles[key].active
                    : quadrantButtonStyles[key].inactive
                }`}
              >
                <span id={`${quadrantIdPrefix}-${key}-title`} className="block">
                  {QUADRANTS[key].title}
                </span>
                <span
                  id={`${quadrantIdPrefix}-${key}-criteria`}
                  className="block text-[9px] font-normal opacity-80"
                >
                  {QUADRANTS[key].criteria}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div ref={deadlineRef} className="mb-6">
          <DeadlineFields
            value={deadlineInput}
            onChange={changeDeadline}
            errorId={deadlineInvalid ? deadlineErrorId : undefined}
          />
          {deadlineInvalid && (
            <p
              id={deadlineErrorId}
              role="alert"
              className="mt-1 text-[10px] font-medium text-red-600 dark:text-red-400"
            >
              Please select a valid deadline date and time
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-300/30 pt-4">
        {showTextError && (
          <p
            id={textErrorId}
            role="alert"
            className="mb-2 text-[10px] font-medium text-red-600 dark:text-red-400"
          >
            Task Description must be between 1 and 200 characters.
          </p>
        )}
        <div className="flex justify-end gap-3 px-1 pb-1">
          <button
            type="button"
            onMouseDown={keepTextFocus}
            onClick={handleCancel}
            className="cursor-pointer rounded-md px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-black/5 active:scale-95 dark:text-gray-400 dark:hover:bg-white/5"
          >
            {BUTTON_CANCEL_TEXT}
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-md bg-indigo-600 px-6 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {BUTTON_SAVE_TEXT}
          </button>
        </div>
      </div>
    </form>
  );
};
