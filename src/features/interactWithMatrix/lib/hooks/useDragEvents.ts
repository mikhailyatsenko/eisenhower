import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useRef, useState } from 'react';
import { MatrixKey, useTaskStore } from '@/shared/stores/tasksStore';
import {
  dragEndAction,
  dragOverQuadrantAction,
} from '@/shared/stores/tasksStore';
import { setRecentlyAddedQuadrantAction } from '@/shared/stores/uiStore';
import { dropIndex, findQuadrant } from '..';
import { MoveTask } from '../../types';

interface DragOrigin {
  quadrantKey: MatrixKey;
  index: number;
}

// The preview moves the task in the store between renders, so handlers read
// the store itself rather than the tasks of the last render
const currentTasks = () => {
  const state = useTaskStore.getState();
  return state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
};

export const useDragEvents = (moveTask: MoveTask) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<MatrixKey | null>(
    null,
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  // Where the task was when the drag started: the preview moves it around
  const origin = useRef<DragOrigin | null>(null);

  const reset = () => {
    origin.current = null;
    setIsDragging(false);
    setDragOverQuadrant(null);
    setActiveTaskId(null);
  };

  /** Undoes the drag preview: puts the task back where the drag found it */
  const putBack = (taskId: string) => {
    const currentArea = findQuadrant(currentTasks(), taskId);
    const start = origin.current;
    if (!start || !currentArea || currentArea === start.quadrantKey) return;
    dragOverQuadrantAction(taskId, currentArea, start.quadrantKey, start.index);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const taskId = event.active.id as string;
    const activeArea = event.active.data.current?.quadrantKey as
      | MatrixKey
      | undefined;
    setDragOverQuadrant(activeArea ?? null);
    setActiveTaskId(taskId);
    origin.current = activeArea
      ? {
          quadrantKey: activeArea,
          index: currentTasks()[activeArea].findIndex(
            (task) => task.id === taskId,
          ),
        }
      : null;
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
    const overArea = over?.data.current?.quadrantKey as MatrixKey | undefined;
    const taskId = active.id as string;
    const start = origin.current;
    setRecentlyAddedQuadrantAction(overArea ?? null);

    if (!overArea || !start) {
      putBack(taskId);
      reset();
      return;
    }

    const tasks = currentTasks();
    const currentArea = findQuadrant(tasks, taskId);
    const activeIndex = tasks[overArea].findIndex((task) => task.id === taskId);
    const overIndex = tasks[overArea].findIndex((task) => task.id === over?.id);

    if (start.quadrantKey === overArea && currentArea === overArea) {
      // Reorder within the quadrant: no toast. Dropped on the quadrant itself,
      // the task keeps the spot it had before the drag (the preview may have
      // taken it out and back, to the end)
      const targetIndex = dropIndex(activeIndex, overIndex, start.index);
      const unchanged =
        activeIndex === start.index && targetIndex === start.index;
      if (targetIndex !== undefined && !unchanged) {
        dragEndAction({
          ...tasks,
          [overArea]: arrayMove(tasks[overArea], activeIndex, targetIndex),
        });
      }
    } else {
      const targetIndex =
        currentArea === overArea
          ? dropIndex(activeIndex, overIndex, activeIndex)
          : undefined;
      // Move goes from where the drag started, so its Undo returns the task there
      putBack(taskId);
      if (start.quadrantKey !== overArea) {
        moveTask(start.quadrantKey, taskId, overArea, targetIndex);
      }
    }

    reset();
  };

  const handleDragCancel = () => {
    if (activeTaskId) putBack(activeTaskId);
    reset();
  };

  return {
    isDragging,
    dragOverQuadrant,
    activeTaskId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
};
