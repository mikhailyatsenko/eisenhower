import { useEffect, useRef } from 'react';

import { QUADRANTS } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { HEADER_STYLES } from '../consts';

/**
 * 'off' on wider screens; on a phone 'closed' in the grid, where the title
 * opens the quadrant, and 'open' while it's full screen
 */
export type FullScreenMode = 'off' | 'closed' | 'open';

interface QuadrantHeaderProps {
  quadrantKey: MatrixKey;
  /** Id of the title, which names the quadrant's task list */
  titleId: string;
  taskCount: number;
  fullScreen: FullScreenMode;
  onFullScreenChange: (isOpen: boolean) => void;
}

/** Title and task count; on a phone also the way in and out of full screen */
export const QuadrantHeader: React.FC<QuadrantHeaderProps> = ({
  quadrantKey,
  titleId,
  taskCount,
  fullScreen,
  onFullScreenChange,
}) => {
  const { title } = QUADRANTS[quadrantKey];
  const isFullScreen = fullScreen === 'open';
  const titleRef = useRef<HTMLHeadingElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  // Set by the user's open or back, not when the selection brings a quadrant
  const focusAfterSwitch = useRef(false);

  useEffect(() => {
    if (!focusAfterSwitch.current) return;
    focusAfterSwitch.current = false;
    (isFullScreen ? titleRef : openButtonRef).current?.focus();
  }, [isFullScreen]);

  const switchTo = (isOpen: boolean) => () => {
    focusAfterSwitch.current = true;
    onFullScreenChange(isOpen);
  };

  const count = (
    <span className={HEADER_STYLES.COUNT}>
      <span aria-hidden="true">{taskCount}</span>
      <span className="sr-only">
        {taskCount} task{taskCount === 1 ? '' : 's'}
      </span>
    </span>
  );

  if (isFullScreen) {
    return (
      <div className={HEADER_STYLES.FULL_SCREEN_HEADER}>
        <button
          type="button"
          onClick={switchTo(false)}
          className={HEADER_STYLES.BACK_BUTTON}
        >
          <span aria-hidden="true">←</span> Back to matrix
        </button>
        <h2
          ref={titleRef}
          id={titleId}
          tabIndex={-1}
          className={HEADER_STYLES.FULL_SCREEN_TITLE}
        >
          {title}
        </h2>
        {count}
      </div>
    );
  }

  if (fullScreen === 'closed') {
    // The list is still named by the title alone, not by the button
    return (
      <h2 className={HEADER_STYLES.HEADER}>
        <button
          ref={openButtonRef}
          type="button"
          aria-label={`Open ${title} full screen`}
          onClick={switchTo(true)}
          className={HEADER_STYLES.OPEN_BUTTON}
        >
          <span id={titleId} className={HEADER_STYLES.TITLE}>
            {title}
          </span>
          {count}
        </button>
      </h2>
    );
  }

  return (
    <div className={HEADER_STYLES.HEADER}>
      {/* Names the task list, so it holds the title only */}
      <h2 id={titleId} className={HEADER_STYLES.TITLE}>
        {title}
      </h2>
      {count}
    </div>
  );
};
