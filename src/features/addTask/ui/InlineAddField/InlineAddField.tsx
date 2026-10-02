'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { addTaskButtonQuadrant } from '@/entities/matrixLayout';
import { MAX_TASK_LENGTH, QUADRANTS } from '@/shared/consts';
import {
  MatrixKey,
  addTaskAction,
  selectTasks,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import {
  closeInlineAddAction,
  getInlineAddReturnFocus,
  recordInlineTaskAddAction,
  requestTaskFocusAction,
  setInlineAddDeadlineAction,
  setInlineAddTextAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { DeadlineStrip, stripEntry } from '../../components/DeadlineStrip';
import { FIELD_BORDER, FIELD_STYLES } from '../../consts';
import { useClearOfStrip } from '../../hooks';
import { addButtonId, scrollIntoArea } from '../../lib';

const getActiveTasks = () => selectTasks(useTaskStore.getState());

interface InlineAddFieldProps {
  quadrant: MatrixKey;
  /**
   * In a List view section, which doesn't scroll by itself: the page
   * scrolls to the field, clear of the sticky headers
   */
  scrollsPage?: boolean;
}

// Clear of the sticky header bars and the section's header above the field
const PAGE_SCROLL_MARGIN =
  'scroll-mt-[calc(var(--top-bars-height,56px)+3.5rem)] scroll-mb-4';

/**
 * The inline add field at the end of the quadrant's list, while it's open
 * there, and the deadline strip for its task at the bottom. Enter or Add adds
 * the task last and keeps the field for the next one, without a deadline; Tab
 * goes to the strip. Esc closes the field and puts the focus back where it was
 * opened from. Focus leaving both the field and the strip closes an empty
 * field; one with text stays open.
 */
export const InlineAddField: React.FC<InlineAddFieldProps> = ({
  quadrant,
  scrollsPage = false,
}) => {
  const inlineAdd = useUIStore((state) =>
    state.inlineAdd?.quadrant === quadrant ? state.inlineAdd : null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [addedCount, setAddedCount] = useState(0);
  const openCount = inlineAdd?.openCount;

  // Every open focuses the field, in the quadrant it's already in too
  useEffect(() => {
    if (openCount) inputRef.current?.focus({ preventScroll: true });
  }, [openCount]);

  // The field, and the task just added above it, stay in sight. In the
  // matrix only the quadrant's list scrolls, not the page.
  useEffect(() => {
    const input = inputRef.current;
    if (!openCount || !input) return;
    if (scrollsPage) input.scrollIntoView({ block: 'nearest' });
    else scrollIntoArea(input);
  }, [openCount, addedCount, scrollsPage]);

  // The strip covers the bottom of the screen: the field stays above it
  const roomUnderField = useClearOfStrip(
    inputRef,
    stripRef,
    scrollsPage,
    !!inlineAdd,
    [openCount, addedCount],
  );

  if (!inlineAdd) return null;

  const { title } = QUADRANTS[quadrant];
  const text = inlineAdd.text.trim();

  const focusField = () => inputRef.current?.focus({ preventScroll: true });

  const add = () => {
    if (!text) return;
    // Silently, no toast, and the new task isn't selected
    addTaskAction(quadrant, text, inlineAdd.deadline);
    recordInlineTaskAddAction();
    setAddedCount((count) => count + 1);
  };

  // An empty field closes once the focus is neither in it nor in the strip
  const closeIfLeftEmpty = (next: EventTarget | null) => {
    const isStillAdding =
      next === inputRef.current ||
      (next instanceof Node && !!stripRef.current?.contains(next));
    if (isStillAdding) return;
    const currentText = useUIStore.getState().inlineAdd?.text ?? '';
    if (currentText.trim() === '') closeInlineAddAction();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      add();
    } else if (event.key === 'Tab' && !event.shiftKey) {
      // Into the strip, on the chip pressed, else on the date
      const target = stripEntry(stripRef.current);
      if (!target) return;
      event.preventDefault();
      target.focus();
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

  return (
    <>
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
        onBlur={(event) => closeIfLeftEmpty(event.relatedTarget)}
        className={twMerge(
          FIELD_STYLES,
          FIELD_BORDER[quadrant],
          scrollsPage && PAGE_SCROLL_MARGIN,
        )}
      />
      {roomUnderField > 0 && (
        <div aria-hidden="true" style={{ height: roomUnderField }} />
      )}
      <DeadlineStrip
        // Each open starts over, folded on a phone
        key={inlineAdd.openCount}
        stripRef={stripRef}
        quadrantTitle={title}
        deadline={inlineAdd.deadline}
        canAdd={!!text}
        onPick={(deadline) => {
          setInlineAddDeadlineAction(deadline);
          focusField();
        }}
        onChange={setInlineAddDeadlineAction}
        onAdd={() => {
          add();
          focusField();
        }}
        onBack={focusField}
        onLeave={closeIfLeftEmpty}
      />
    </>
  );
};
