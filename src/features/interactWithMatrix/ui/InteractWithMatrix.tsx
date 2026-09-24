'use client';

import {
  DndContext,
  DragOverlay,
  closestCenter,
  defaultDropAnimation,
  DropAnimation,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useEffect } from 'react';
import { MatrixLayout, TaskDragPreview } from '@/entities/matrixLayout';
import { useTaskStore } from '@/shared/stores/tasksStore';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';

import { useDragEvents } from '../lib/hooks';
import { useQuadrantExpansion } from '../lib/hooks';
import { useQuadrantOrder } from '../lib/hooks';
import { useScreenSize } from '../lib/hooks';
import { MoveTask } from '../types';

interface InteractWithMatrixProps {
  setExpandedQuadrant: React.Dispatch<React.SetStateAction<MatrixKey | null>>;
  expandedQuadrant: MatrixKey | null;
  taskInputText: string;
  moveTask: MoveTask;
}

export const InteractWithMatrix: React.FC<InteractWithMatrixProps> = ({
  expandedQuadrant,
  setExpandedQuadrant,
  taskInputText,
  moveTask,
}) => {
  const { activeState, localTasks, firebaseTasks } = useTaskStore();
  const tasks = activeState === 'local' ? localTasks : firebaseTasks;

  const {
    isDragging,
    dragOverQuadrant,
    activeTaskId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragEvents(moveTask);

  // A click selects, a drag starts after the pointer moves a few pixels.
  // No keyboard drag: the keyboard moves tasks between quadrants with 1–4.
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 10 },
    }),
  );

  const { isSmallScreen } = useScreenSize();

  const { isAnimateByExpandQuadrant, handleToggleExpand } =
    useQuadrantExpansion(expandedQuadrant, setExpandedQuadrant);

  // Auto-collapse empty quadrants
  useEffect(() => {
    if (
      !isDragging &&
      expandedQuadrant &&
      tasks[expandedQuadrant].length === 0
    ) {
      handleToggleExpand(expandedQuadrant);
    }
  }, [tasks, expandedQuadrant, isDragging, handleToggleExpand]);

  const quadrantOrder = useQuadrantOrder(taskInputText);

  const dropAnimation: DropAnimation | null = isSmallScreen
    ? null
    : defaultDropAnimation;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <MatrixLayout
        tasks={tasks}
        quadrantOrder={quadrantOrder}
        dragOverQuadrant={dragOverQuadrant}
        expandedQuadrant={expandedQuadrant}
        isAnimateByExpandQuadrant={isAnimateByExpandQuadrant}
        handleToggleExpand={handleToggleExpand}
        taskInputText={taskInputText}
      />

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTaskId ? (
          <TaskDragPreview
            task={
              tasks[dragOverQuadrant as MatrixKey].find(
                (t) => t.id === activeTaskId,
              ) as Task
            }
            quadrantKey={dragOverQuadrant as MatrixKey}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Import these separately to avoid circular dependencies
