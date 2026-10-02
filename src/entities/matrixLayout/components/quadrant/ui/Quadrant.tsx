import { useDroppable } from '@dnd-kit/core';
import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { MatrixKey } from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { useEmptySpaceClick } from '../../../hooks';
import { FullScreenMode, QuadrantHeader } from '../../quadrantHeader';
import { DRAG_OVER_RING, QUADRANT_STYLES } from '../consts';
import { quadrantStyles } from '../lib/quadrantStyles';

export interface QuadrantProps {
  quadrantKey: MatrixKey;
  /** Id of the title, which names the quadrant's task list */
  titleId: string;
  isDragOver: boolean;
  children: React.ReactNode;
  recentlyAddedQuadrant: MatrixKey | null;
  taskCount: number;
  fullScreen: FullScreenMode;
  onFullScreenChange: (isOpen: boolean) => void;
  /** A button after the title in the header */
  headerAction: React.ReactNode;
  /** A click on empty space with no task selected */
  onEmptySpaceClick: () => void;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  quadrantKey,
  titleId,
  isDragOver,
  recentlyAddedQuadrant,
  taskCount,
  fullScreen,
  onFullScreenChange,
  headerAction,
  onEmptySpaceClick,
  children,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

  const isFullScreen = fullScreen === 'open';
  const rootRef = useRef<HTMLDivElement | null>(null);
  const addFieldOpenCount = useUIStore((state) =>
    state.inlineAdd?.quadrant === quadrantKey ? state.inlineAdd.openCount : 0,
  );

  // Full screen on a phone, the add field and the deadline strip over the
  // keyboard leave little room: the quadrant goes up under the top bars,
  // the page's title out of sight
  useEffect(() => {
    if (isFullScreen && addFieldOpenCount) {
      rootRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [isFullScreen, addFieldOpenCount]);

  const animateByRecentlyAddedQuadrant =
    recentlyAddedQuadrant === quadrantKey
      ? 'animate-recently-added-quadrant'
      : '';

  const handleEmptySpaceClick = useEmptySpaceClick();

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        rootRef.current = node;
      }}
      className={twMerge(
        quadrantStyles[quadrantKey],
        QUADRANT_STYLES.DEFAULT,
        animateByRecentlyAddedQuadrant,
        isDragOver && [QUADRANT_STYLES.DRAG_OVER, DRAG_OVER_RING[quadrantKey]],
        QUADRANT_STYLES.CONTAINER,
        isFullScreen && QUADRANT_STYLES.FULL_SCREEN,
      )}
      onClick={(event) => handleEmptySpaceClick(event, onEmptySpaceClick)}
    >
      <QuadrantHeader
        quadrantKey={quadrantKey}
        titleId={titleId}
        taskCount={taskCount}
        fullScreen={fullScreen}
        onFullScreenChange={onFullScreenChange}
        headerAction={headerAction}
      />
      {children}
    </div>
  );
};
