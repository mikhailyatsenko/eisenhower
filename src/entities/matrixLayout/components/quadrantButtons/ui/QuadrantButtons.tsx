import { MatrixKey } from '@/shared/stores/tasksStore';
import { buttonStyles } from '../../quadrant/lib/buttonStyles';
import { COLLAPSE_BUTTON_TEXT, EXPAND_BUTTON_TEXT } from '../consts';

interface ButtonsProps {
  isExpandedCurrentQuadrant: boolean;
  quadrantKey: MatrixKey;
  handleToggleExpand: (quadrant: MatrixKey) => void;
}

export const Buttons: React.FC<ButtonsProps> = ({
  isExpandedCurrentQuadrant,
  quadrantKey,
  handleToggleExpand,
}) => {
  return (
    <>
      <div
        className={`relative z-2 flex h-full w-full items-center justify-center text-gray-500 ${isExpandedCurrentQuadrant ? 'hidden' : 'flex sm:hidden'}`}
      >
        <button
          className={`${buttonStyles[quadrantKey]} cursor-pointer rounded-md p-2 text-gray-100 dark:border-2 dark:bg-transparent`}
          onClick={() => handleToggleExpand(quadrantKey)}
        >
          {EXPAND_BUTTON_TEXT}
        </button>
      </div>
      {isExpandedCurrentQuadrant && (
        <button
          onClick={() => handleToggleExpand(quadrantKey)}
          className={`absolute bottom-0 left-0 z-3 flex h-8 w-full cursor-pointer items-center justify-center bg-gray-500 opacity-60 hover:opacity-85 dark:bg-gray-300`}
        >
          <p className="text-background text-sm">{COLLAPSE_BUTTON_TEXT}</p>
        </button>
      )}
    </>
  );
};
