'use client';

import { useCallback, useEffect, useState } from 'react';
import { TaskMatrix } from '@/entities/taskMatrix';
import { getAllTasks } from '@/entities/taskMatrix/model/selectors/tasksSelector';
import { getIsLoading } from '@/entities/taskMatrix/model/selectors/uiSelectors';
import {
  dragEndAction,
  dragOverQuadrantAction,
  useTaskStore,
} from '@/entities/taskMatrix/model/store/tasksStore';
import { useUIStore } from '@/entities/taskMatrix/model/store/uiStore';
import { MatrixKey } from '@/entities/taskMatrix/model/types/taskMatrixTypes';
import { useDragEvents } from '../lib/hooks/useDragEvents';
export const InteractWithMatrix = () => {
  const tasks = useTaskStore(getAllTasks);

  const isLoading = useUIStore(getIsLoading);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<MatrixKey | null>(
    null,
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const dragEvents = useDragEvents({
    setDragOverQuadrant,
    setActiveTaskId,
    setIsDragging,
    tasks,
    dragEndAction,
    dragOverQuadrantAction,
  });

  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isSmallScreen) {
      setExpandedQuadrant(null);
    }
  }, [isSmallScreen]);

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

  useEffect(() => {
    if (
      !isDragging &&
      expandedQuadrant &&
      tasks[expandedQuadrant].length === 0
    ) {
      handleToggleExpand(expandedQuadrant);
    }
  }, [tasks, expandedQuadrant, isDragging, handleToggleExpand]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <TaskMatrix
      expandedQuadrant={expandedQuadrant}
      activeTaskId={activeTaskId}
      dragOverQuadrant={dragOverQuadrant}
      isAnimateQuadrants={isAnimateQuadrants}
      handleToggleExpand={handleToggleExpand}
      isSmallScreen={isSmallScreen}
      dragEvents={dragEvents}
    />
  );
};
