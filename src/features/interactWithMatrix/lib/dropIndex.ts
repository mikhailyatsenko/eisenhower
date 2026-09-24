/**
 * Where the dragged task lands in the quadrant it was dropped on: on the task
 * it was dropped over, or, when dropped on the quadrant itself, at `fallback`.
 */
export const dropIndex = (
  activeIndex: number,
  overIndex: number,
  fallback: number,
) => {
  if (activeIndex === -1) return undefined;
  return overIndex === -1 ? fallback : overIndex;
};
