import Link from 'next/link';
import {
  ADD_HINT,
  DRAG_HINT,
  MATRIX_SHORTCUTS,
} from '@/shared/consts/matrixShortcuts';
import { Modal } from '@/shared/ui/modal';
import { ShortcutsTable } from '@/shared/ui/shortcutsTable';

interface ShortcutsDialogProps {
  onClose: () => void;
}

/**
 * The cheatsheet that ? opens: adding, every matrix key, Undo and drag, and
 * last the way to the method page
 */
export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({
  onClose,
}) => (
  <Modal label="Keyboard shortcuts" onClose={onClose} width="xl">
    <div className="flex max-h-[calc(100dvh-40px)] w-full flex-col overflow-y-auto p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Keyboard shortcuts</h2>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg px-3 py-1.5 text-sm hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-indigo-700 dark:hover:bg-gray-800 dark:focus-visible:outline-indigo-300"
        >
          Close
        </button>
      </div>
      <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        {ADD_HINT}
      </p>
      <ShortcutsTable shortcuts={MATRIX_SHORTCUTS} />
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
        {DRAG_HINT}
      </p>
      <Link
        href="/eisenhower-matrix"
        className="mt-4 self-start rounded text-sm font-medium text-indigo-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 dark:text-indigo-300 dark:focus-visible:outline-indigo-300"
      >
        How the Eisenhower Matrix works →
      </Link>
    </div>
  </Modal>
);
