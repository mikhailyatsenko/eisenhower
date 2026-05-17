import React from 'react';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { openFormWithCategoryAction } from '@/shared/stores/uiStore';

interface InsertTaskZoneProps {
  quadrantKey: MatrixKey;
  index: number;
}

export const InsertTaskZone: React.FC<InsertTaskZoneProps> = ({
  quadrantKey,
  index,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFormWithCategoryAction(quadrantKey, index);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex h-2 w-full shrink-0 cursor-pointer items-center justify-center transition-all hover:h-6 hover:bg-indigo-500/5 dark:hover:bg-indigo-400/5"
    >
      {/* The Line */}
      <div className="h-[1px] w-full bg-gray-400/20 transition-all group-hover:h-[2px] group-hover:bg-indigo-500/50 dark:bg-gray-500/20" />

      {/* The Plus Button */}
      <div className="absolute z-10 flex h-6 w-6 scale-50 items-center justify-center rounded-full bg-indigo-500 opacity-0 shadow-md transition-all group-hover:scale-100 group-hover:opacity-100 dark:bg-indigo-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    </div>
  );
};
