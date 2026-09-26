import {
  setViewModeAction,
  useUIStore,
  type ViewMode,
} from '@/shared/stores/uiStore';

/**
 * The one way the view changes: the new one opens at the top of the page,
 * at once, not with a smooth scroll
 */
export const switchView = (viewMode: ViewMode) => {
  if (useUIStore.getState().viewMode === viewMode) return;
  setViewModeAction(viewMode);
  window.scrollTo({ top: 0, behavior: 'instant' });
};
