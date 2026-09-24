import { useId, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { MATRIX_KEYS, QUADRANTS } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { useToastClearance } from '@/shared/ui/toast';
import { TaskLocation } from '../../../types';
import { QUADRANT_DOT } from '../consts';

interface ActionToolbarProps {
  location: TaskLocation;
  onComplete: () => void;
  onEdit: () => void;
  onMove: (toQuadrant: MatrixKey) => void;
  onDelete: () => void;
}

const BUTTON_CLASS =
  'cursor-pointer rounded-lg px-3 py-2 hover:bg-white/10 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent';

const Divider = () => (
  <span aria-hidden="true" className="mx-1 h-6 w-px bg-white/20" />
);

/**
 * Labelled actions for the Selected Task, pinned to the bottom of the window.
 * Its appearance isn't announced: aria-selected on the task already is.
 */
export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  location: { task, quadrantKey },
  onComplete,
  onEdit,
  onMove,
  onDelete,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  useToastClearance(toolbarRef);
  const moveToLabelId = useId();

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label={`Actions for “${task.text}”`}
      className="fixed bottom-4 left-1/2 z-40 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-xl bg-gray-900 p-1.5 text-sm text-white shadow-2xl dark:bg-gray-800"
    >
      <button
        type="button"
        onClick={onComplete}
        className={twMerge(
          BUTTON_CLASS,
          'bg-green-700 font-bold hover:bg-green-800',
        )}
      >
        Complete
      </button>
      <button type="button" onClick={onEdit} className={BUTTON_CLASS}>
        Edit
      </button>

      <Divider />
      <div
        role="group"
        aria-labelledby={moveToLabelId}
        className="flex flex-wrap items-center justify-center gap-1"
      >
        <span id={moveToLabelId} className="px-1 text-gray-300">
          Move to
        </span>
        {MATRIX_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={key === quadrantKey}
            onClick={() => onMove(key)}
            className={twMerge(BUTTON_CLASS, 'px-2')}
          >
            <span
              aria-hidden="true"
              className={twMerge(
                'mr-1.5 inline-block h-2 w-2 rounded-full',
                QUADRANT_DOT[key],
              )}
            />
            {QUADRANTS[key].title}
          </button>
        ))}
      </div>
      <Divider />

      <button
        type="button"
        onClick={onDelete}
        className={twMerge(BUTTON_CLASS, 'text-red-300')}
      >
        Delete
      </button>
    </div>
  );
};
