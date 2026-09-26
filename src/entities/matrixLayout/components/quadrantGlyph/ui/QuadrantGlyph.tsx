import { twMerge } from 'tailwind-merge';
import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { GLYPH_CELL_CLASS, GLYPH_OTHER_CELL_CLASS } from '../consts';

interface QuadrantGlyphProps {
  quadrant: MatrixKey;
}

/** A 2×2 with the quadrant's cell lit: where it sits in the matrix */
export const QuadrantGlyph: React.FC<QuadrantGlyphProps> = ({ quadrant }) => (
  <span
    aria-hidden="true"
    className="grid size-4 shrink-0 grid-cols-2 gap-px self-center"
  >
    {MATRIX_KEYS.map((key) => (
      <span
        key={key}
        className={twMerge(
          'rounded-[1px]',
          key === quadrant ? GLYPH_CELL_CLASS[key] : GLYPH_OTHER_CELL_CLASS,
        )}
      />
    ))}
  </span>
);
