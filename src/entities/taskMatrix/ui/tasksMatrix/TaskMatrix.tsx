'use client';

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
} from '@dnd-kit/core';
import { KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
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
  const [activeQuadrant, setActiveQuadrant] = useState<MatrixKey | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const selectedCategory = useTaskStore((state) => state.selectedCategory);
  const taskText = useTaskStore((state) => state.taskText);
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const activeArea = event.active.data.current?.quadrantKey as MatrixKey;

    setActiveQuadrant(activeArea);
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overArea = event.over?.data.current?.quadrantKey as MatrixKey;
    const activeArea = event.active.data.current?.quadrantKey as MatrixKey;

    if (overArea && overArea !== activeArea) {
      setActiveQuadrant(overArea);
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

    if (!overArea || !activeArea) {
      setActiveQuadrant(null);
      setActiveId(null);
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

    setActiveQuadrant(null);
    setActiveId(null);
  };

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
  };

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [expandedQuadrant, setExpandedQuadrant] = useState<MatrixKey | null>(
    null,
  );
  const [isAnimateQuadrants, setIsAnimateQuadrants] = useState<boolean>(false);

  const handleToggleExpand = (quadrant: MatrixKey) => {
    setIsAnimateQuadrants(true);

    setTimeout(() => {
      setIsAnimateQuadrants(false);
    }, 400);

    setExpandedQuadrant(expandedQuadrant === quadrant ? null : quadrant);
  };

  useEffect(() => {
    if (
      !isDragging &&
      expandedQuadrant &&
      tasks[expandedQuadrant].length === 0
    ) {
      setExpandedQuadrant(null);
    }
  }, [tasks, expandedQuadrant, isDragging]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex w-full flex-wrap pt-6">
      {!expandedQuadrant && (
        <div className="absolute flex h-6 w-full -translate-y-full flex-nowrap">
          <div className="w-1/2 text-center">Urgent</div>
          <div className="w-1/2 text-center">Not Urgent</div>
        </div>
      )}
      {!expandedQuadrant && (
        <div className="absolute flex h-full w-6 -translate-x-full flex-col">
          <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
            Important
          </div>
          <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
            Not Important
          </div>
        </div>
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
            expandedQuadrant={isSmallScreen ? expandedQuadrant : null}
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
