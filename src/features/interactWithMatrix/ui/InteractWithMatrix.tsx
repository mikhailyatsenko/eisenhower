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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useEffect, useState } from 'react';
import { MatrixQuadrants } from '@/entities/Matrix';
import { getAllTasks } from '@/entities/Matrix/model/selectors/tasksSelector';
import {
  getRecentlyAddedQuadrant,
  getSelectedCategory,
} from '@/entities/Matrix/model/selectors/uiSelectors';
import { useTaskStore } from '@/entities/Matrix/model/store/tasksStore';
import {
  deleteTaskAction,
  editTaskAction,
} from '@/entities/Matrix/model/store/tasksStore';
import { useUIStore } from '@/entities/Matrix/model/store/uiStore';
import { MatrixKey, Task } from '@/entities/Matrix/model/types/taskMatrixTypes';
import { Quadrant } from '@/entities/quadrant';
import { TaskItem } from '@/entities/taskItem';

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

  const recentlyAddedQuadrant = useUIStore(getRecentlyAddedQuadrant);

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
          isAnimateByExpandQuadrant={isAnimateByExpandQuadrant}
          handleToggleExpand={handleToggleExpand}
          expandedQuadrant={expandedQuadrant}
          key={key}
          quadrantKey={key as MatrixKey}
          isDragOver={dragOverQuadrant === key}
          orderIndex={quadrantOrder.indexOf(key)}
          isTypingNewTask={taskInputText.trim() !== ''}
          recentlyAddedQuadrant={recentlyAddedQuadrant}
          isNoTasks={tasks[key as MatrixKey].length === 0}
        >
          <SortableContext
            items={tasks[key as MatrixKey]}
            strategy={verticalListSortingStrategy}
          >
            <ul
              className={`scrollbar-hidden relative z-2 list-none flex-col ${expandedQuadrant === key ? 'flex pb-8' : 'hidden'} h-full overflow-x-hidden overflow-y-auto sm:flex`}
            >
              {tasks[key as MatrixKey].map((task, index) => (
                <TaskItem
                  deleteTaskAction={deleteTaskAction}
                  editTaskAction={editTaskAction}
                  key={task.id}
                  task={task}
                  quadrantKey={key as MatrixKey}
                  index={index}
                />
              ))}
            </ul>

            <p
              className={`text-foreground absolute top-0 left-1 z-0 text-7xl opacity-15 sm:top-1 sm:left-6 sm:text-sm sm:opacity-50 ${tasks[key as MatrixKey].length === 0 ? 'sm:!text-7xl sm:!opacity-25' : ''}`}
            >
              {expandedQuadrant !== key &&
                `${tasks[key as MatrixKey].length} task${tasks[key as MatrixKey].length !== 1 ? 's' : ''}`}
            </p>
          </SortableContext>
        </Quadrant>
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
