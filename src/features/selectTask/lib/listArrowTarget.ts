import { ListSection, MatrixStop, isSameStop } from '@/entities/matrixLayout';
import { ArrowKey } from '../types';

/**
 * Where an arrow goes in List view from a task or an empty section's "Add a
 * task". Up and down walk the stops across sections without wrapping; left
 * and right go to the first stop of the previous or next section. Only the
 * sections on screen count. Null when there's nowhere to go.
 */
export const listArrowTarget = (
  sections: ListSection[],
  from: MatrixStop,
  key: ArrowKey,
): MatrixStop | null => {
  const isFrom = (stop: MatrixStop) => isSameStop(stop, from);

  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const sectionIndex = sections.findIndex(({ stops }) => stops.some(isFrom));
    if (sectionIndex === -1) return null;
    const step = key === 'ArrowRight' ? 1 : -1;
    return sections[sectionIndex + step]?.stops[0] ?? null;
  }

  const stops = sections.flatMap((section) => section.stops);
  const index = stops.findIndex(isFrom);
  if (index === -1) return null;
  return stops[index + (key === 'ArrowDown' ? 1 : -1)] ?? null;
};
