import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  dragEndAction,
  dragOverQuadrantAction,
} from '@/entities/Matrix/model/store/tasksStore';
import { setRecentlyAddedQuadrantAction } from '@/entities/Matrix/model/store/uiStore';
import { MatrixKey, Task } from '@/entities/Matrix/model/types/taskMatrixTypes';

export const handleDragStart = (
  event: DragStartEvent,
  setIsDragging: (isDragging: boolean) => void,
  setDragOverQuadrant: (quadrant: MatrixKey | null) => void,
  setActiveTaskId: (taskId: string | null) => void,
) => {
  setIsDragging(true);
  const activeArea = event.active.data.current?.quadrantKey as MatrixKey;
  setDragOverQuadrant(activeArea);
  setActiveTaskId(event.active.id as string);
};

export const handleDragOver = (
  event: DragOverEvent,
  setDragOverQuadrant: (quadrant: MatrixKey | null) => void,
) => {
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

export const handleDragEnd = (
  { over, active }: DragEndEvent,
  setIsDragging: (isDragging: boolean) => void,
  setDragOverQuadrant: (quadrant: MatrixKey | null) => void,
  setActiveTaskId: (taskId: string | null) => void,
  tasks: Record<MatrixKey, Task[]>,
) => {
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
