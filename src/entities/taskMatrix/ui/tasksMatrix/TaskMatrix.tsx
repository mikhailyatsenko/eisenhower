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
} from '../../model/store/tasksStore';
import { MatrixKey } from '../../model/types/quadrantTypes';
import { Quadrant } from '../quadrant/Quadrant';
import { TaskItem } from '../taskItem/TaskItem';

export const TaskMatrix = () => {
  const tasks = useTaskStore(getAllTasks);
  const [activeQuadrant, setActiveQuadrant] = useState<MatrixKey | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
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
    if (overQuadrant && overQuadrant !== activeQuadrant) {
      setActiveQuadrant(overQuadrant);
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
      moveTaskToQuadrantAction(task, activeQuadrant, overQuadrant);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {Object.entries(MatrixQuadrants).map(([key, label]) => (
          <Quadrant
            key={key}
            title={label}
            quadrantKey={key as MatrixKey}
            tasks={tasks[key as MatrixKey]}
            isActive={activeQuadrant === key}
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
