import {
  setViewModeAction,
  useUIStore,
  type ViewMode,
} from '@/shared/stores/uiStore';

interface SwitchViewOptions {
  /**
   * False when the caller scrolls the new view itself: "✓ N completed →"
   * goes to the Completed section, not past it to the top
   */
  scrollsToTop?: boolean;
}

/**
 * The one way the view changes: the new one opens at the top of the page,
 * at once, not with a smooth scroll
 */
export const switchView = (
  viewMode: ViewMode,
  { scrollsToTop = true }: SwitchViewOptions = {},
) => {
  if (useUIStore.getState().viewMode === viewMode) return;
  setViewModeAction(viewMode);
  if (scrollsToTop) window.scrollTo({ top: 0, behavior: 'instant' });
};
