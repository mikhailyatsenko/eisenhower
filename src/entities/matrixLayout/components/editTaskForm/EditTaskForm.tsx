import { addHours, startOfTomorrow, isValid as isValidDate } from 'date-fns';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { Task, MatrixKey, MatrixQuadrants } from '@/shared/stores/tasksStore';
import { BUTTON_CANCEL_TEXT, BUTTON_SAVE_TEXT } from '../../consts';

interface EditFormProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  task: Task;
  handleSave: (
    editText: string,
    dueDate: Date | null,
    newQuadrant?: MatrixKey,
  ) => void;
  onQuadrantChange?: (quadrant: MatrixKey) => void;
}

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
  const [hasDeadline, setHasDeadline] = useState(!!task.dueDate);
  const [dueDate, setDueDate] = useState<Date | null>(
    task.dueDate ? new Date(task.dueDate) : null,
  );
  const [selectedQuadrant, setSelectedQuadrant] = useState<MatrixKey>(
    task.quadrantKey || 'NotImportantNotUrgent',
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(editText.length > 0 && editText.length <= 200);
  }, [editText]);

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleQuadrantClick = (key: MatrixKey) => {
    setSelectedQuadrant(key);
    onQuadrantChange?.(key);
  };

  const toggleDeadline = (enabled: boolean) => {
    setHasDeadline(enabled);
    if (enabled && !dueDate) {
      setDueDate(new Date());
    }
    if (!enabled) {
      setSelectedPreset(null);
    }
  };

  const setPreset = (date: Date, label: string) => {
    setHasDeadline(true);
    setDueDate(date);
    setSelectedPreset(label);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isValid) {
      onSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const onSave = () => {
    if (!isValid) return;

    if (hasDeadline) {
      if (!dueDate || !isValidDate(dueDate)) {
        toast.error('Please select a valid deadline date and time');
        return;
      }
      handleSave(editText, dueDate, selectedQuadrant);
    } else {
      handleSave(editText, null, selectedQuadrant);
    }
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
          <label className="mb-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Task Description
          </label>
          <textarea
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] w-full resize-none rounded-md border border-gray-300 bg-white/50 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-100"
            placeholder="What needs to be done?"
          />
        </div>

        <div className="mb-4 flex flex-col">
          <label className="mb-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Quadrant
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(MatrixQuadrants) as MatrixKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleQuadrantClick(key)}
                className={`rounded-md border p-2 text-left text-[10px] font-bold transition-all ${
                  selectedQuadrant === key
                    ? quadrantButtonStyles[key].active
                    : quadrantButtonStyles[key].inactive
                }`}
              >
                {MatrixQuadrants[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-col">
          <label className="mb-2 flex items-center justify-between border-b border-gray-500/10 pb-1">
            <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Deadline (Optional)
            </div>
            <div className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={hasDeadline}
                onChange={(e) => toggleDeadline(e.target.checked)}
              />
              <div className="peer h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-indigo-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700"></div>
            </div>
          </label>

          {hasDeadline && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="mb-2 flex flex-wrap gap-1">
                <PresetButton
                  onClick={() => setPreset(addHours(new Date(), 1), '+1h')}
                  label="+1h"
                  isActive={selectedPreset === '+1h'}
                />
                <PresetButton
                  onClick={() => setPreset(addHours(new Date(), 3), '+3h')}
                  label="+3h"
                  isActive={selectedPreset === '+3h'}
                />
                <PresetButton
                  onClick={() =>
                    setPreset(addHours(startOfTomorrow(), 9), 'Tmr 9am')
                  }
                  label="Tmr 9am"
                  isActive={selectedPreset === 'Tmr 9am'}
                />
              </div>
              <div className="flex gap-2">
                <div className="w-[135px] shrink-0">
                  <DatePicker
                    selected={dueDate}
                    onChange={(date: Date | null) => {
                      setDueDate(date);
                      setSelectedPreset(null);
                    }}
                    dateFormat="dd/MM/yyyy"
                    portalId="datepicker-portal"
                    className="w-full rounded-md border border-gray-300 bg-white/50 px-2 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-100"
                    placeholderText="Select date"
                  />
                </div>
                <div className="w-[85px] shrink-0">
                  <DatePicker
                    selected={dueDate}
                    onChange={(date: Date | null) => {
                      setDueDate(date);
                      setSelectedPreset(null);
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    portalId="datepicker-portal"
                    className="w-full rounded-md border border-gray-300 bg-white/50 px-2 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-100"
                    placeholderText="Time"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-300/30 pt-4">
        {!isValid && (
          <p className="mb-2 text-[10px] font-medium text-red-600 dark:text-red-400">
            Task Description must be between 1 and 200 characters.
          </p>
        )}
        <div className="flex justify-end gap-3 px-1 pb-1">
          <button
            type="button"
            onClick={handleCancel}
            className="cursor-pointer rounded-md px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-black/5 active:scale-95 dark:text-gray-400 dark:hover:bg-white/5"
            data-no-dnd="true"
          >
            {BUTTON_CANCEL_TEXT}
          </button>
          <button
            type="submit"
            className={`cursor-pointer rounded-md bg-indigo-600 px-6 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 ${
              !isValid ? 'pointer-events-none opacity-30' : ''
            }`}
            data-no-dnd="true"
            disabled={!isValid}
          >
            {BUTTON_SAVE_TEXT}
          </button>
        </div>
      </div>
    </form>
  );
};

const PresetButton = ({
  onClick,
  label,
  isActive,
}: {
  onClick: () => void;
  label: string;
  isActive?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer rounded-md px-2 py-1 text-[10px] font-bold transition-all ${
      isActive
        ? 'bg-white/60 text-indigo-700 shadow-sm dark:bg-gray-600 dark:text-white'
        : 'bg-white/30 text-gray-600 hover:bg-white/50 dark:bg-gray-800/30 dark:text-gray-300 dark:hover:bg-gray-800/50'
    }`}
    data-no-dnd="true"
  >
    {label}
  </button>
);
