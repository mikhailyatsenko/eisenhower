import type { ViewMode } from '@/shared/stores/uiStore';

/** The view's tab in the header, which names the view area */
export const viewTabId = (mode: ViewMode) => `view-tab-${mode}`;
