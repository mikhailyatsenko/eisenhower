import { useCallback, useState } from 'react';
import { MatrixKey } from '@/entities/taskMatrix/model/types/taskMatrixTypes';

export const useExpandedQuadrant = () => {
  const [expandedQuadrant, setExpandedQuadrant] = useState<MatrixKey | null>(
    null,
  );
  const [isAnimateQuadrants, setIsAnimateQuadrants] = useState<boolean>(false);

  const handleToggleExpand = useCallback(
    (quadrant: MatrixKey) => {
      setIsAnimateQuadrants(true);

      setTimeout(() => {
        setIsAnimateQuadrants(false);
      }, 400);

      setExpandedQuadrant(expandedQuadrant === quadrant ? null : quadrant);
    },
    [expandedQuadrant],
  );

  return {
    expandedQuadrant,
    handleToggleExpand,
    isAnimateQuadrants,
    setExpandedQuadrant,
  };
};
