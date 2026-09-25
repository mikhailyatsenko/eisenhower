import { useEffect } from 'react';
import { MATRIX_KEYS } from '@/shared/consts';
import { useIsPhone } from '@/shared/hooks';
import { Tasks } from '@/shared/stores/tasksStore';
import {
  setFullScreenQuadrantAction,
  useUIStore,
} from '@/shared/stores/uiStore';

/**
 * The quadrant open full screen, only ever on a phone: a wider screen shows
 * the whole matrix. The selected task, a task just added or restored, the add
 * field and the "Add a task" the keyboard goes to stay in sight: when they
 * are in another quadrant, that quadrant opens instead.
 */
export const useFullScreenQuadrant = (tasks: Tasks) => {
  const isPhone = useIsPhone();
  const openQuadrant = useUIStore((state) => state.fullScreenQuadrant);
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const recentlyAddedQuadrant = useUIStore(
    (state) => state.recentlyAddedQuadrant,
  );
  const addTaskButtonToFocus = useUIStore(
    (state) => state.addTaskButtonToFocus,
  );
  const inlineAddQuadrant = useUIStore(
    (state) => state.inlineAdd?.quadrant ?? null,
  );
  const fullScreenQuadrant = isPhone ? openQuadrant : null;

  const selectedQuadrant = MATRIX_KEYS.find((key) =>
    tasks[key].some(({ id }) => id === selectedTaskId),
  );

  useEffect(() => {
    if (!fullScreenQuadrant || !selectedQuadrant) return;
    if (selectedQuadrant !== fullScreenQuadrant) {
      setFullScreenQuadrantAction(selectedQuadrant);
    }
  }, [fullScreenQuadrant, selectedQuadrant]);

  // Only when it changes: it stays set for the length of the animation. The
  // add field and the "Add a task" the keyboard goes to follow the same rule.
  useEffect(() => {
    const quadrant =
      recentlyAddedQuadrant ?? addTaskButtonToFocus ?? inlineAddQuadrant;
    if (!quadrant) return;
    const { fullScreenQuadrant: open } = useUIStore.getState();
    if (open && open !== quadrant) setFullScreenQuadrantAction(quadrant);
  }, [recentlyAddedQuadrant, addTaskButtonToFocus, inlineAddQuadrant]);

  return { fullScreenQuadrant, isPhone };
};
