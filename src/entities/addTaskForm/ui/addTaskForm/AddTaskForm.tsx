import React, { useRef } from 'react';
// eslint-disable-next-line boundaries/element-types
import { MatrixKey } from '@/entities/Tasks/@x/matrixKey'; //@x notation is used to cross-imports between slices (see https://feature-sliced.design/docs/guides/examples/types)
// eslint-disable-next-line boundaries/element-types
import { MatrixQuadrants } from '@/entities/Tasks/@x/matrixQuadrants'; //@x notation is used to cross-imports between slices (see https://feature-sliced.design/docs/guides/examples/types)
import { colors } from '../../lib/colors';

interface AddTaskFormProps {
  taskInputText: string;
  setTaskInputTextAction: (text: string) => void;
  isValid: boolean;
  selectedCategory: MatrixKey;
  handleCategoryChange: (key: MatrixKey) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLSpanElement>,
    key: MatrixKey,
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({
  taskInputText,
  setTaskInputTextAction,
  isValid,
  selectedCategory,
  handleCategoryChange,
  handleKeyDown,
  handleSubmit,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e);
  };

  const handleCategoryClick = (key: MatrixKey) => {
    handleCategoryChange(key);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      autoComplete="off"
      className="mx-auto mt-2 mt-8 mb-4 max-w-md gap-2"
    >
      <div className="space-y-3">
        <input
          ref={inputRef}
          className="block w-full border-b-2 border-x-transparent border-t-transparent border-b-gray-400 bg-transparent px-0 py-3 text-sm focus:border-b-black focus:ring-0 focus-visible:outline-0 disabled:pointer-events-none disabled:opacity-50 dark:border-b-gray-400 dark:text-white dark:focus:border-b-white"
          value={taskInputText}
          onChange={(e) => setTaskInputTextAction(e.target.value)}
          id="addTask"
          placeholder="Enter task"
          tabIndex={1}
        />
        {!isValid && (
          <p className="text-xs text-red-400">
            Task text must be between 1 and 200 characters.
          </p>
        )}
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
              className={`h-5 w-5 rounded-full border-2 ${colors[key as MatrixKey].peerCheckedBg} ${colors[key as MatrixKey].border}`}
              onKeyDown={(e) => handleKeyDown(e, key as MatrixKey)}
            ></span>
          </label>
        ))}

        <button
          type="submit"
          disabled={!isValid}
          className={`${colors[selectedCategory].border} ${colors[selectedCategory].hover} text-foreground cursor-pointer rounded-sm border-2 px-3 py-1.5 text-sm font-medium hover:text-white disabled:opacity-50`}
          tabIndex={5}
        >
          Add task
        </button>
      </div>
    </form>
  );
};
