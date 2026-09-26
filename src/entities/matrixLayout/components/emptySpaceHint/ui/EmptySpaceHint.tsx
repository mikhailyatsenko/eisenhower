import { useIsTouchScreen } from '@/shared/hooks';
import { useUIStore } from '@/shared/stores/uiStore';
import { EMPTY_SPACE_HINT_STYLES } from '../consts';

/**
 * "click empty space to add" in a wide quadrant's header, for a mouse, until
 * a task is first added that way on this device
 */
export const EmptySpaceHint: React.FC = () => {
  const isTouchScreen = useIsTouchScreen();
  const hasAddedByEmptySpace = useUIStore(
    (state) => state.hasAddedByEmptySpace,
  );

  if (isTouchScreen || hasAddedByEmptySpace) return null;

  return (
    <span className={EMPTY_SPACE_HINT_STYLES}>click empty space to add</span>
  );
};
