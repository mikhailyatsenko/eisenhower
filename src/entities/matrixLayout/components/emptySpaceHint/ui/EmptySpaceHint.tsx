import { useIsPhone, useIsTouchScreen } from '@/shared/hooks';
import { useUIStore } from '@/shared/stores/uiStore';
import { EMPTY_SPACE_HINT_STYLES } from '../consts';

/**
 * "click empty space to add" in the header of a quadrant or an open List
 * view section, for a mouse, 640px and wider, until a task is first added
 * that way on this device
 */
export const EmptySpaceHint: React.FC = () => {
  const isTouchScreen = useIsTouchScreen();
  const isPhone = useIsPhone();
  const hasAddedByEmptySpace = useUIStore(
    (state) => state.hasAddedByEmptySpace,
  );

  if (isTouchScreen || isPhone || hasAddedByEmptySpace) return null;

  return (
    <span className={EMPTY_SPACE_HINT_STYLES}>click empty space to add</span>
  );
};
