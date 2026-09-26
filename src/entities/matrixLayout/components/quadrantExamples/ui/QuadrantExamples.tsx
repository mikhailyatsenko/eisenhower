import { QUADRANTS } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { QUADRANT_EXAMPLES_STYLES } from '../consts';

interface QuadrantExamplesProps {
  quadrant: MatrixKey;
}

/** What goes in an empty quadrant, as the method page says it */
export const QuadrantExamples: React.FC<QuadrantExamplesProps> = ({
  quadrant,
}) => (
  <p className={QUADRANT_EXAMPLES_STYLES}>{QUADRANTS[quadrant].examples}</p>
);
