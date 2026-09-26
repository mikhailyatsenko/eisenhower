'use client';

import { useIsUIStoreRestored, useUIStore } from '@/shared/stores/uiStore';
import { VIEW_PANEL_ID } from '../consts';
import { viewTabId } from '../lib';

// The view area the tabs in the header switch, named by the selected one:
// no name until the stored view is read and a tab is selected
export const ViewPanel = ({ children }: { children: React.ReactNode }) => {
  const viewMode = useUIStore((state) => state.viewMode);
  const isRestored = useIsUIStoreRestored();

  return (
    <div
      role="tabpanel"
      id={VIEW_PANEL_ID}
      aria-labelledby={isRestored ? viewTabId(viewMode) : undefined}
    >
      {children}
    </div>
  );
};
