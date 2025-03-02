'use client';

import { useEffect, useState } from 'react';
import { TaskMatrix } from '@/entities/taskMatrix';
import { getAllTasks } from '@/entities/taskMatrix/model/selectors/tasksSelector';
import {
  getIsLoading,
  getTaskInputText,
} from '@/entities/taskMatrix/model/selectors/uiSelectors';
import {
  dragEndAction,
  dragOverQuadrantAction,
  useTaskStore,
} from '@/entities/taskMatrix/model/store/tasksStore';
import { useUIStore } from '@/entities/taskMatrix/model/store/uiStore';
import { MatrixKey } from '@/entities/taskMatrix/model/types/taskMatrixTypes';
import { useWindowResize } from '@/shared/hooks/useWindowResize';
import { useDragEvents } from '../lib/hooks/useDragEvents';
import { useExpandedQuadrant } from '../lib/hooks/useExpandedQuadrant';
export const InteractWithMatrix = () => {
  const tasks = useTaskStore(getAllTasks);

  const isLoading = useUIStore(getIsLoading);
  const taskInputText = useUIStore(getTaskInputText);
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

  const {
    expandedQuadrant,
    handleToggleExpand,
    isAnimateQuadrants,
    setExpandedQuadrant,
  } = useExpandedQuadrant();

  const isSmallScreen = useWindowResize();

  useEffect(() => {
    if (!isSmallScreen || taskInputText.trim() !== '') {
      setExpandedQuadrant(null);
    }
  }, [isSmallScreen, setExpandedQuadrant, taskInputText]);

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
      isAnimateByExpandQuadrant={isAnimateQuadrants}
      handleToggleExpand={handleToggleExpand}
      isSmallScreen={isSmallScreen}
      dragEvents={dragEvents}
    />
  );
};
