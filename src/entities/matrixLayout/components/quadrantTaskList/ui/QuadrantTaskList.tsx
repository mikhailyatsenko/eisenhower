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
}

/** A quadrant's scrolling task list with "+N below" when tasks don't fit */
export const QuadrantTaskList: React.FC<QuadrantTaskListProps> = ({
  labelledBy,
  children,
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const { count, recount } = useTasksBelowCount(listRef);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const scrollDown = () => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({
      top: scrollTopBelow(list),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div className={LIST_STYLES.WRAPPER}>
      <ul
        ref={listRef}
        role="listbox"
        aria-labelledby={labelledBy}
        onScroll={recount}
        className={LIST_STYLES.LIST}
      >
        {children}
      </ul>
      {count > 0 && <MoreBelowButton count={count} onClick={scrollDown} />}
    </div>
  );
};
