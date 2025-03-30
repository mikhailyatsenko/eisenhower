'use client';

import {
  DndContext,
  DragOverlay,
  closestCenter,
  defaultDropAnimation,
  DropAnimation,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEffect } from 'react';
import { MatrixLayout } from '@/entities/matrixLayout';
import { TaskItem } from '@/entities/matrixLayout/components/taskItem';
import { MouseSensor, TouchSensor } from '@/shared/lib/CustomSensors';
import { useTaskStore } from '@/shared/stores/tasksStore';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';

import { useDragEvents } from '../lib/hooks';
import { useQuadrantExpansion } from '../lib/hooks';
import { useQuadrantOrder } from '../lib/hooks';
import { useScreenSize } from '../lib/hooks';

interface InteractWithMatrixProps {
  setExpandedQuadrant: React.Dispatch<React.SetStateAction<MatrixKey | null>>;
  expandedQuadrant: MatrixKey | null;
  taskInputText: string;
}

export const InteractWithMatrix: React.FC<InteractWithMatrixProps> = ({
  expandedQuadrant,
  setExpandedQuadrant,
  taskInputText,
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
  } = useDragEvents(tasks);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
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
          <TaskItem
            task={
              tasks[dragOverQuadrant as MatrixKey].find(
                (t) => t.id === activeTaskId,
              ) as Task
            }
            quadrantKey={dragOverQuadrant as MatrixKey}
            index={0}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Import these separately to avoid circular dependencies
