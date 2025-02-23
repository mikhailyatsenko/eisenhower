'use client';

import {
  DndContext,
  closestCenter,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
} from '@dnd-kit/core';
import { KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback, useEffect, useState } from 'react';
import { useDragEvents } from '@/entities/taskMatrix/lib/hooks/useDragEvents';
import { useWindowSize } from '@/shared/hooks/useWindowSize';
import { MouseSensor, TouchSensor } from '@/shared/lib/CustomSensors';
import { MatrixQuadrants } from '../../model/consts/taskMatrixConsts';
import { getAllTasks } from '../../model/selectors/tasksSelector';
import {
  useTaskStore,
  dragEndAction,
  dragOverQuadrantAction,
} from '../../model/store/tasksStore';
import { MatrixKey, Task } from '../../model/types/quadrantTypes';
import { Quadrant } from '../quadrant/Quadrant';
import { TaskItem } from '../taskItem/TaskItem';

export const TaskMatrix = () => {
  const tasks = useTaskStore(getAllTasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const selectedCategory = useTaskStore((state) => state.selectedCategory);
  const taskText = useTaskStore((state) => state.taskText);

  const [activeQuadrant, setActiveQuadrant] = useState<MatrixKey | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedQuadrant, setExpandedQuadrant] = useState<MatrixKey | null>(
    null,
  );
  const [isAnimateQuadrants, setIsAnimateQuadrants] = useState<boolean>(false);

  const { isSmallScreen } = useWindowSize();
  const { handleDragStart, handleDragOver, handleDragEnd } = useDragEvents({
    setActiveQuadrant,
    setActiveId,
    setIsDragging,
    tasks,
    dragEndAction,
    dragOverQuadrantAction,
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
  };

  useEffect(() => {
    if (!isSmallScreen) {
      setExpandedQuadrant(null);
    }
  }, [isSmallScreen]);

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
    <div className="relative flex w-full flex-wrap pt-6">
      {!expandedQuadrant && (
        <>
          <div className="absolute flex h-6 w-full -translate-y-full flex-nowrap">
            <div className="w-1/2 text-center">Urgent</div>
            <div className="w-1/2 text-center">Not Urgent</div>
          </div>
          <div className="absolute flex h-full w-6 -translate-x-full flex-col">
            <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
              Important
            </div>
            <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
              Not Important
            </div>
          </div>
        </>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {Object.entries(MatrixQuadrants).map(([key]) => (
          <Quadrant
            isAnimateQuadrants={isAnimateQuadrants}
            handleToggleExpand={handleToggleExpand}
            expandedQuadrant={expandedQuadrant}
            key={key}
            quadrantKey={key as MatrixKey}
            tasks={tasks[key as MatrixKey]}
            isActive={activeQuadrant === key}
            isDimmed={taskText.trim() !== '' && selectedCategory !== key}
          />
        ))}
        <DragOverlay dropAnimation={isSmallScreen ? null : dropAnimation}>
          {activeId ? (
            <TaskItem
              task={
                tasks[activeQuadrant as MatrixKey].find(
                  (t) => t.id === activeId,
                ) as Task
              }
              quadrantKey={activeQuadrant as MatrixKey}
              index={0}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
