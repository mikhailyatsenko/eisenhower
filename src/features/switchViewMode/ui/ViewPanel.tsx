'use client';

import { useUIStore } from '@/shared/stores/uiStore';
import { VIEW_PANEL_ID } from '../consts';
import { viewTabId } from '../lib';

// The view area the tabs in the header switch, named by the selected one
export const ViewPanel = ({ children }: { children: React.ReactNode }) => {
  const viewMode = useUIStore((state) => state.viewMode);

  return (
    <div
      role="tabpanel"
      id={VIEW_PANEL_ID}
      aria-labelledby={viewTabId(viewMode)}
    >
      {children}
    </div>
  );
};
