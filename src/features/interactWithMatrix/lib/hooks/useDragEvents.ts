import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { MatrixKey } from '@/entities/taskMatrix';
import { setRecentlyAddedQuadrantAction } from '@/entities/taskMatrix/model/store/uiStore';
import { Tasks } from '@/entities/taskMatrix/model/types/taskMatrixTypes';

interface UseDragEventsProps {
  setDragOverQuadrant: (quadrant: MatrixKey | null) => void;
  setActiveTaskId: (id: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  tasks: Tasks;
  dragEndAction: (newTasks: Tasks) => void;
  dragOverQuadrantAction: (
    taskId: string,
    fromQuadrant: MatrixKey,
    toQuadrant: MatrixKey,
  ) => void;
}

export const useDragEvents = ({
  setDragOverQuadrant,
  setActiveTaskId,
  setIsDragging,
  tasks,
  dragEndAction,
  dragOverQuadrantAction,
}: UseDragEventsProps) => {
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const activeArea = event.active.data.current?.quadrantKey as MatrixKey;
    setDragOverQuadrant(activeArea);
    setActiveTaskId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
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

  const handleDragEnd = ({ over, active }: DragEndEvent) => {
    const overArea = over?.data.current?.quadrantKey as MatrixKey;
    const activeArea = active.data.current?.quadrantKey as MatrixKey;
    setIsDragging(false);
    console.log('inside dragEnd', overArea);
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

  return { handleDragStart, handleDragOver, handleDragEnd };
};
