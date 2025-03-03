'use client';

import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  DropAnimation,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback, useEffect, useState } from 'react';
import { MatrixQuadrants } from '@/entities/taskMatrix';
import { getAllTasks } from '@/entities/taskMatrix/model/selectors/tasksSelector';
import { getSelectedCategory } from '@/entities/taskMatrix/model/selectors/uiSelectors';
import { useTaskStore } from '@/entities/taskMatrix/model/store/tasksStore';
import { useUIStore } from '@/entities/taskMatrix/model/store/uiStore';
import {
  MatrixKey,
  Task,
} from '@/entities/taskMatrix/model/types/taskMatrixTypes';
import { Quadrant } from '@/entities/taskMatrix/ui/quadrant/Quadrant';
import { TaskItem } from '@/entities/taskMatrix/ui/taskItem/TaskItem';
import { MouseSensor, TouchSensor } from '@/shared/lib/CustomSensors';
import { useDragEvents } from '../lib/useDragEvents';

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
  const tasks = useTaskStore(getAllTasks);

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
  }, [isSmallScreen, setExpandedQuadrant, taskInputText]);

  const [isAnimateByExpandQuadrant, setIsAnimateByExpandQuadrant] =
    useState<boolean>(false);

  const handleToggleExpand = useCallback(
    (quadrant: MatrixKey) => {
      setIsAnimateByExpandQuadrant(true);

      setTimeout(() => {
        setIsAnimateByExpandQuadrant(false);
      }, 400);

      setExpandedQuadrant(expandedQuadrant === quadrant ? null : quadrant);
    },
    [expandedQuadrant, setExpandedQuadrant],
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

  const [quadrantOrder, setQuadrantOrder] = useState([
    'ImportantUrgent',
    'ImportantNotUrgent',
    'NotImportantUrgent',
    'NotImportantNotUrgent',
  ]);

  const selectedCategory = useUIStore(getSelectedCategory);

  useEffect(() => {
    let newOrder = [
      'ImportantUrgent',
      'ImportantNotUrgent',
      'NotImportantUrgent',
      'NotImportantNotUrgent',
    ];

    if (taskInputText.trim() !== '' && selectedCategory) {
      newOrder = newOrder.filter((q) => q !== selectedCategory);
      newOrder.unshift(selectedCategory);
    }

    setQuadrantOrder(newOrder);
  }, [taskInputText, selectedCategory]);

  const dropAnimation: DropAnimation | null = isSmallScreen
    ? null
    : {
        ...defaultDropAnimation,
      };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {Object.entries(MatrixQuadrants).map(([key]) => (
        <Quadrant
          tasks={tasks[key as MatrixKey]}
          isAnimateByExpandQuadrant={isAnimateByExpandQuadrant}
          handleToggleExpand={handleToggleExpand}
          expandedQuadrant={expandedQuadrant}
          key={key}
          quadrantKey={key as MatrixKey}
          isDragOver={dragOverQuadrant === key}
          orderIndex={quadrantOrder.indexOf(key)}
          isTypingNewTask={taskInputText.trim() !== ''}
        />
      ))}
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
