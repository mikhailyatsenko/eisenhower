'use client';

import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useEffect, useState } from 'react';
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
import {
  setRecentlyAddedQuadrantAction,
  useUIStore,
} from '@/entities/taskMatrix/model/store/uiStore';
import { MatrixKey } from '@/entities/taskMatrix/model/types/taskMatrixTypes';

export const InteractWithMatrix = () => {
  const tasks = useTaskStore(getAllTasks);

  const isLoading = useUIStore(getIsLoading);
  const taskInputText = useUIStore(getTaskInputText);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<MatrixKey | null>(
    null,
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const activeArea = event.active.data.current?.quadrantKey as MatrixKey;
    setDragOverQuadrant(activeArea);
    setActiveTaskId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overArea = event.over?.data.current?.quadrantKey as MatrixKey;
    const activeArea = event.active.data.current?.quadrantKey as MatrixKey;

    if (overArea && overArea !== activeArea) {
      setDragOverQuadrant(overArea);
    }

    const taskId = event.active.id as string;

    if (activeArea && overArea && activeArea !== overArea) {
      dragOverQuadrantAction(taskId, activeArea, overArea);
    }
  };

  const handleDragEnd = ({ over, active }: DragEndEvent) => {
    const overArea = over?.data.current?.quadrantKey as MatrixKey;
    const activeArea = active.data.current?.quadrantKey as MatrixKey;
    setIsDragging(false);
    setRecentlyAddedQuadrantAction(overArea);
    if (!overArea || !activeArea) {
      setDragOverQuadrant(null);
      setActiveTaskId(null);
      return;
    }

    const activeIndex = tasks[activeArea].findIndex(
      (task) => task.id === active.id,
    );
    const overIndex = tasks[overArea].findIndex((task) => task.id === over?.id);

    if (
      activeIndex !== undefined &&
      overIndex !== undefined &&
      activeIndex !== overIndex
    ) {
      const newTasks = {
        ...tasks,
        [overArea]: arrayMove(tasks[overArea], activeIndex, overIndex),
      };
      dragEndAction(newTasks);
    }

    setDragOverQuadrant(null);
    setActiveTaskId(null);
  };

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
    if (!isSmallScreen || taskInputText.trim() !== '') {
      setExpandedQuadrant(null);
    }
  }, [isSmallScreen, taskInputText]);

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
      isAnimateByExpandQuadrant={isAnimateQuadrants}
      handleToggleExpand={handleToggleExpand}
      isSmallScreen={isSmallScreen}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDragEnd={handleDragEnd}
    />
  );
};
