'use client';

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { MatrixQuadrants } from '../../model/consts/taskMatrixConsts';
import { getAllTasks } from '../../model/selectors/tasksSelector';
import {
  useTaskStore,
  moveTaskToQuadrantAction,
  reorderTasksAction,
  dragOverQuadrantAction,
} from '../../model/store/tasksStore';
import { MatrixKey } from '../../model/types/quadrantTypes';
import { Quadrant } from '../quadrant/Quadrant';
import { TaskItem } from '../taskItem/TaskItem';

export const TaskMatrix = () => {
  const tasks = useTaskStore(getAllTasks);
  const [activeQuadrant, setActiveQuadrant] = useState<MatrixKey | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const selectedCategory = useTaskStore((state) => state.selectedCategory);
  const taskText = useTaskStore((state) => state.taskText);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const activeQuadrant = event.active.data.current?.quadrantKey as MatrixKey;

    setActiveQuadrant(activeQuadrant);
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overQuadrant = event.over?.data.current?.quadrantKey as MatrixKey;
    const activeQuadrant = event.active.data.current?.quadrantKey as MatrixKey;

    if (overQuadrant && overQuadrant !== activeQuadrant) {
      setActiveQuadrant(overQuadrant);
    }
    const task = event.active.id as string;

    if (activeQuadrant && overQuadrant && activeQuadrant !== overQuadrant) {
      dragOverQuadrantAction(task, activeQuadrant, overQuadrant);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveQuadrant(null);
    setActiveId(null);
    if (!over) return;

    const activeQuadrant = active.data.current?.quadrantKey as MatrixKey;
    const overQuadrant = over.data.current?.quadrantKey as MatrixKey;

    if (activeQuadrant && overQuadrant && activeQuadrant === overQuadrant) {
      const activeIndex = active.data.current?.index;
      const overIndex = over.data.current?.index;

      if (
        activeIndex !== undefined &&
        overIndex !== undefined &&
        activeIndex !== overIndex
      ) {
        reorderTasksAction(activeQuadrant, activeIndex, overIndex);
      }
    } else if (
      activeQuadrant &&
      overQuadrant &&
      activeQuadrant !== overQuadrant
    ) {
      const task = active.id as string;
      const overIndex = over.data.current?.index;
      moveTaskToQuadrantAction(task, activeQuadrant, overQuadrant, overIndex);
    }
  };

  const [expandedQuadrant, setExpandedQuadrant] = useState<MatrixKey | null>(
    null,
  );
  const [animateQuadrants, setAnimateQuadrants] = useState<MatrixKey[]>([]);

  const handleToggleExpand = (quadrant: MatrixKey) => {
    console.log('animate');
    setAnimateQuadrants(
      Object.keys(MatrixQuadrants).filter(
        (key) => key !== quadrant,
      ) as MatrixKey[],
    );

    setTimeout(() => {
      setAnimateQuadrants([]);
    }, 1000);

    setExpandedQuadrant(expandedQuadrant === quadrant ? null : quadrant);
  };

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
            isAnimateNotExpandedQuadrant={animateQuadrants.includes(
              key as MatrixKey,
            )}
            handleToggleExpand={handleToggleExpand}
            expandedQuadrant={expandedQuadrant}
            key={key}
            quadrantKey={key as MatrixKey}
            tasks={tasks[key as MatrixKey]}
            isActive={activeQuadrant === key}
            isDimmed={taskText.trim() !== '' && selectedCategory !== key}
          />
        ))}
        <DragOverlay>
          {activeId ? (
            <TaskItem
              task={activeId}
              quadrantKey={activeQuadrant as MatrixKey}
              index={0}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
