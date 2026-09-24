import { twMerge } from 'tailwind-merge';

// Small caps labels on a phone, where the grid needs every pixel
const AXIS_LABEL =
  'text-[10px] font-bold tracking-wider text-gray-600 uppercase sm:text-base sm:font-normal sm:tracking-normal sm:normal-case sm:text-foreground dark:text-gray-400 dark:sm:text-foreground';

export const TaskMatrixHeaders: React.FC = () => {
  return (
    <>
      <div
        className={twMerge(
          'absolute flex h-4 w-full -translate-y-full flex-nowrap select-none sm:h-6',
          AXIS_LABEL,
        )}
      >
        <div className="w-1/2 text-center">Urgent</div>
        <div className="w-1/2 text-center">Not Urgent</div>
      </div>
      <div
        className={twMerge(
          'absolute left-0 flex h-full w-4 -translate-x-full flex-col sm:w-6',
          AXIS_LABEL,
        )}
      >
        <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
          Important
        </div>
        <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
          Not Important
        </div>
      </div>
    </>
  );
};
