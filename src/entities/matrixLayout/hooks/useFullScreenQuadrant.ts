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
 * the whole matrix. The selected task and a task just added or restored stay
 * in sight: when they are in another quadrant, that quadrant opens instead.
 */
export const useFullScreenQuadrant = (tasks: Tasks) => {
  const isPhone = useIsPhone();
  const openQuadrant = useUIStore((state) => state.fullScreenQuadrant);
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const recentlyAddedQuadrant = useUIStore(
    (state) => state.recentlyAddedQuadrant,
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

  // Only when it changes: it stays set for the length of the animation
  useEffect(() => {
    if (!recentlyAddedQuadrant) return;
    const { fullScreenQuadrant: open } = useUIStore.getState();
    if (open && open !== recentlyAddedQuadrant) {
      setFullScreenQuadrantAction(recentlyAddedQuadrant);
    }
  }, [recentlyAddedQuadrant]);

  return { fullScreenQuadrant, isPhone };
};
