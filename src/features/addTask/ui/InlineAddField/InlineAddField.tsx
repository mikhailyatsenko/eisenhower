'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { addTaskButtonQuadrant } from '@/entities/matrixLayout';
import { QUADRANTS } from '@/shared/consts';
import {
  MatrixKey,
  addTaskAction,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import {
  closeInlineAddAction,
  getInlineAddReturnFocus,
  requestTaskFocusAction,
  setInlineAddTextAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { FIELD_BORDER, FIELD_STYLES, MAX_TASK_LENGTH } from '../../consts';
import { addButtonId, scrollIntoArea } from '../../lib';

const getActiveTasks = () => {
  const state = useTaskStore.getState();
  return state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
};

interface InlineAddFieldProps {
  quadrant: MatrixKey;
}

/**
 * The inline add field at the end of the quadrant's list, while it's open
 * there. Enter adds the task last and keeps the field for the next one, Esc
 * closes it and puts the focus back where the field was opened from. Focus
 * leaving closes an empty field; one with text stays open.
 */
export const InlineAddField: React.FC<InlineAddFieldProps> = ({ quadrant }) => {
  const inlineAdd = useUIStore((state) =>
    state.inlineAdd?.quadrant === quadrant ? state.inlineAdd : null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [addedCount, setAddedCount] = useState(0);
  const openCount = inlineAdd?.openCount;

  // Every open focuses the field, in the quadrant it's already in too
  useEffect(() => {
    if (openCount) inputRef.current?.focus({ preventScroll: true });
  }, [openCount]);

  // The field, and the task just added above it, stay in sight. Only the
  // quadrant's list scrolls, not the page.
  useEffect(() => {
    const input = inputRef.current;
    if (openCount && input) scrollIntoArea(input);
  }, [openCount, addedCount]);

  if (!inlineAdd) return null;

  const { title } = QUADRANTS[quadrant];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      const text = inlineAdd.text.trim();
      if (!text) return;
      // Silently, no toast, and the new task isn't selected
      addTaskAction(quadrant, text);
      setInlineAddTextAction('');
      setAddedCount((count) => count + 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      const returnFocus = getInlineAddReturnFocus();
      const lastTaskId = getActiveTasks()[quadrant].at(-1)?.id;
      closeInlineAddAction();
      if (returnFocus?.isConnected) {
        // Back where the keyboard or "Add a task" opened the field from
        returnFocus.focus();
      } else if (
        addTaskButtonQuadrant(returnFocus) === quadrant &&
        lastTaskId
      ) {
        // "Add a task" has given way to the tasks just added: the last one
        requestTaskFocusAction(lastTaskId);
      } else {
        document.getElementById(addButtonId(quadrant))?.focus();
      }
    }
  };

  const handleBlur = () => {
    const text = useUIStore.getState().inlineAdd?.text ?? '';
    if (text.trim() === '') closeInlineAddAction();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      aria-label={`Add task to ${title}`}
      placeholder={`Add task to ${title}`}
      value={inlineAdd.text}
      maxLength={MAX_TASK_LENGTH}
      enterKeyHint="enter"
      autoComplete="off"
      onChange={(event) => setInlineAddTextAction(event.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={twMerge(FIELD_STYLES, FIELD_BORDER[quadrant])}
    />
  );
};
