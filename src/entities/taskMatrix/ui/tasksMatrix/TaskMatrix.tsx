'use client';

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { MatrixQuadrants } from '../../model/consts/taskMatrixConsts';
import { getAllTasks } from '../../model/selectors/tasksSelector';
import {
  useTaskStore,
  moveTaskToQuadrantAction,
  reorderTasksAction,
} from '../../model/store/tasksStore';
import { MatrixKey } from '../../model/types/quadrantTypes';
import { Quadrant } from '../quadrant/Quadrant';

export const TaskMatrix = () => {
  const tasks = useTaskStore(getAllTasks);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
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
        onDragEnd={handleDragEnd}
      >
        {Object.entries(MatrixQuadrants).map(([key, label]) => (
          <SortableContext key={key} items={tasks[key as MatrixKey]}>
            <Quadrant
              key={key}
              title={label}
              quadrantKey={key as MatrixKey}
              tasks={tasks[key as MatrixKey]}
            />
          </SortableContext>
        ))}
      </DndContext>
    </div>
  );
};
