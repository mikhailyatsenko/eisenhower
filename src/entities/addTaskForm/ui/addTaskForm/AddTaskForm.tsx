import React, { useRef, useState } from 'react';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { MatrixQuadrants } from '@/shared/stores/tasksStore/consts';
import { BUTTON_COLORS, ERROR_MESSAGE, BUTTON_TEXT } from '../../consts';
import { FloatButton } from '../FloatButton/FloatButton';

export interface AddTaskFormProps {
  taskInputText: string;
  setTaskInputTextAction: (text: string) => void;
  isValid: boolean;
  selectedCategory: MatrixKey;
  handleCategoryChange: (key: MatrixKey) => void;
  handleOnRadioKeyDown: (
    e: React.KeyboardEvent<HTMLSpanElement>,
    key: MatrixKey,
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isNoTasks: boolean;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({
  taskInputText,
  setTaskInputTextAction,
  isValid,
  selectedCategory,
  handleCategoryChange,
  handleOnRadioKeyDown,
  handleSubmit,
  isNoTasks,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpened, setIsOpened] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e);
  };

  const handleCategoryClick = (key: MatrixKey) => {
    handleCategoryChange(key);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleToggleActive = () => {
    if (isOpened) {
      setTaskInputTextAction('');
      inputRef.current?.blur();
    } else {
      inputRef.current?.focus();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 310);
    }
    setIsOpened(!isOpened);
  };

  return (
    <>
      <FloatButton
        isNoTasks={isNoTasks}
        active={isOpened}
        toggleActive={handleToggleActive}
      />
      <form
        onSubmit={handleFormSubmit}
        autoComplete="off"
        className={`${isOpened ? 'mb-6 h-[106px]' : 'h-0'} mx-auto mt-2 mt-8 mb-4 max-w-md gap-2 overflow-hidden duration-300`}
      >
        <div className="space-y-3">
          <input
            data-testid="add-task-input"
            ref={inputRef}
            className="block w-full scroll-m-40 border-b-2 border-x-transparent border-t-transparent border-b-gray-400 bg-transparent px-0 py-3 text-sm focus:border-b-black focus:ring-0 focus-visible:outline-0 disabled:pointer-events-none disabled:opacity-50 dark:border-b-gray-400 dark:text-white dark:focus:border-b-white"
            value={taskInputText}
            onChange={(e) => setTaskInputTextAction(e.target.value)}
            id="addTask"
            placeholder="Enter task"
            tabIndex={1}
          />
          {!isValid && <p className="text-xs text-red-400">{ERROR_MESSAGE}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 py-3">
          {Object.keys(MatrixQuadrants).map((key, index) => (
            <label key={key} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === key}
                onChange={() => handleCategoryClick(key as MatrixKey)}
                key={key}
                value={key}
                className="peer hidden"
              />
              <span
                tabIndex={index + 1}
                className={`h-5 w-5 rounded-md border-2 ${BUTTON_COLORS[key as MatrixKey].peerCheckedBg} ${BUTTON_COLORS[key as MatrixKey].border}`}
                onKeyDown={(e) => handleOnRadioKeyDown(e, key as MatrixKey)}
              ></span>
            </label>
          ))}

          <button
            type="submit"
            data-testid="add-task-button"
            disabled={!isValid}
            className={`${BUTTON_COLORS[selectedCategory].border} ${BUTTON_COLORS[selectedCategory].hover} text-foreground cursor-pointer rounded-md border-2 px-3 py-1.5 text-sm font-medium hover:text-white disabled:opacity-50`}
            tabIndex={5}
          >
            {BUTTON_TEXT}
          </button>
        </div>
      </form>
    </>
  );
};
