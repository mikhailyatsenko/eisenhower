import { useRef } from 'react';

import { useMediaQuery } from '@/shared/hooks';
import { LIST_STYLES } from '../consts';
import { useTasksBelowCount } from '../hooks';
import { scrollTopBelow } from '../lib';
import { MoreBelowButton } from './MoreBelowButton';

interface QuadrantTaskListProps {
  /** Id of the quadrant title, which names the list */
  labelledBy: string;
  children: React.ReactNode;
  /** After the tasks, in the scrolling area but outside the list */
  end: React.ReactNode;
}

/** A quadrant's scrolling task list with "+N below" when tasks don't fit */
export const QuadrantTaskList: React.FC<QuadrantTaskListProps> = ({
  labelledBy,
  children,
  end,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { count, recount } = useTasksBelowCount(scrollAreaRef);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const scrollDown = () => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    scrollArea.scrollTo({
      top: scrollTopBelow(scrollArea),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div className={LIST_STYLES.WRAPPER}>
      <div
        ref={scrollAreaRef}
        onScroll={recount}
        className={LIST_STYLES.SCROLL_AREA}
      >
        <ul
          role="listbox"
          aria-labelledby={labelledBy}
          className={LIST_STYLES.LIST}
        >
          {children}
        </ul>
        {end}
      </div>
      {count > 0 && <MoreBelowButton count={count} onClick={scrollDown} />}
    </div>
  );
};
