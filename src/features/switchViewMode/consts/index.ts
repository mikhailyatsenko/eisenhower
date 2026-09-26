import type { ViewMode } from '@/shared/stores/uiStore';

export const VIEWS: { mode: ViewMode; label: string }[] = [
  { mode: 'matrix', label: 'Matrix' },
  { mode: 'list', label: 'List' },
];

// The tabs in the header and the view area in the matrix are far apart in
// the tree: ids tie them together
export const VIEW_PANEL_ID = 'view-panel';
