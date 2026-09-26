import { useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { QUADRANTS } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { SECTION_TOGGLE_ATTRIBUTE } from '../../../lib';
import { QuadrantGlyph } from '../../quadrantGlyph';
import { SECTION_HEADER_STYLES, SECTION_TITLE_COLOR } from '../consts';

interface SectionHeaderProps {
  quadrant: MatrixKey;
  /** Id of the title, which names the section's task list */
  titleId: string;
  /** Id of the section's task list, which the toggle controls */
  listId: string;
  taskCount: number;
  isCollapsed: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
  /** A button after the toggle, like the quadrant's "+" */
  headerAction?: React.ReactNode;
}

const tasksLabel = (count: number) => `${count} task${count === 1 ? '' : 's'}`;

/**
 * A List view section's sticky header: the glyph, the title, the criteria
 * and the count. Its button collapses the section and is named "Do First,
 * 3 tasks", described by the criteria. An empty section can't collapse: its
 * header is the heading alone.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  quadrant,
  titleId,
  listId,
  taskCount,
  isCollapsed,
  onCollapsedChange,
  headerAction,
}) => {
  const { title, criteria } = QUADRANTS[quadrant];
  const criteriaId = useId();

  const content = (
    <>
      <QuadrantGlyph quadrant={quadrant} />
      <span
        id={titleId}
        className={twMerge(
          SECTION_HEADER_STYLES.TITLE,
          SECTION_TITLE_COLOR[quadrant],
        )}
      >
        {title}
      </span>
      <span id={criteriaId} className={SECTION_HEADER_STYLES.CRITERIA}>
        {criteria}
      </span>
      <span className={SECTION_HEADER_STYLES.COUNT}>
        <span aria-hidden="true">· {taskCount}</span>
        <span className="sr-only">{tasksLabel(taskCount)}</span>
      </span>
    </>
  );

  return (
    <div className={SECTION_HEADER_STYLES.HEADER}>
      <h2 className={SECTION_HEADER_STYLES.HEADING}>
        {taskCount === 0 ? (
          <span className={SECTION_HEADER_STYLES.STATIC}>{content}</span>
        ) : (
          <button
            type="button"
            aria-label={`${title}, ${tasksLabel(taskCount)}`}
            aria-describedby={criteriaId}
            aria-expanded={!isCollapsed}
            aria-controls={listId}
            onClick={() => onCollapsedChange(!isCollapsed)}
            {...{ [SECTION_TOGGLE_ATTRIBUTE]: '' }}
            className={SECTION_HEADER_STYLES.TOGGLE}
          >
            {content}
            <span
              aria-hidden="true"
              className={twMerge(
                SECTION_HEADER_STYLES.CHEVRON,
                isCollapsed && '-rotate-90',
              )}
            >
              ▾
            </span>
          </button>
        )}
      </h2>
      {headerAction}
    </div>
  );
};
