import { useState, useCallback, useEffect } from 'react';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { setSelectedCategoryAction } from '@/shared/stores/uiStore';

export const useQuadrantExpansion = (
  expandedQuadrant: MatrixKey | null,
  setExpandedQuadrant: React.Dispatch<React.SetStateAction<MatrixKey | null>>,
) => {
  const [isAnimateByExpandQuadrant, setIsAnimateByExpandQuadrant] =
    useState<boolean>(false);

  const handleToggleExpand = useCallback(
    (quadrant: MatrixKey) => {
      setIsAnimateByExpandQuadrant(true);

      setTimeout(() => {
        setIsAnimateByExpandQuadrant(false);
      }, 400);

      setExpandedQuadrant(expandedQuadrant === quadrant ? null : quadrant);
      setSelectedCategoryAction(
        expandedQuadrant === quadrant ? 'ImportantUrgent' : quadrant,
      );
    },
    [expandedQuadrant, setExpandedQuadrant],
  );

  // Auto-collapse on small screens or when typing new task
  useEffect(() => {
    const isSmallScreen =
      typeof window !== 'undefined' ? window.innerWidth < 640 : false;
    const inputElement = document.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    const taskInputText = inputElement?.value || '';

    if (!isSmallScreen || taskInputText.trim() !== '') {
      setExpandedQuadrant(null);
    }
  }, [setExpandedQuadrant]); // Dependencies might need adjustment based on actual code

  return {
    isAnimateByExpandQuadrant,
    handleToggleExpand,
  };
};
