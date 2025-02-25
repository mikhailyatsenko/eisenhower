import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/entities/taskMatrix/model/store/uiStore';
import { MouseSensor, TouchSensor } from '@/shared/lib/CustomSensors';
import { MatrixKey } from '../../@x/matrixKey';
import { MatrixQuadrants } from '../../model/consts/taskMatrixConsts';
import { getAllTasks } from '../../model/selectors/tasksSelector';
import {
  getIsLoading,
  getSelectedCategory,
  getTaskInputText,
} from '../../model/selectors/uiSelectors';
import { useTaskStore } from '../../model/store/tasksStore';
import { Task } from '../../model/types/taskMatrixTypes';
import { Quadrant } from '../quadrant/Quadrant';
import { TaskItem } from '../taskItem/TaskItem';

interface DragEvents {
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: ({ over, active }: DragEndEvent) => void;
}

interface TaskMatrixProps {
  expandedQuadrant: MatrixKey | null;
  dragEvents: DragEvents;
  isAnimateQuadrants: boolean;
  handleToggleExpand: (quadrant: MatrixKey) => void;
  dragOverQuadrant: MatrixKey | null;
  isSmallScreen: boolean;
  activeTaskId: string | null;
}

export const TaskMatrix: React.FC<TaskMatrixProps> = ({
  expandedQuadrant,
  dragEvents,
  isAnimateQuadrants,
  handleToggleExpand,
  dragOverQuadrant,
  isSmallScreen,
  activeTaskId,
}) => {
  const isLoading = useUIStore(getIsLoading);

  const tasks = useTaskStore(getAllTasks);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { handleDragStart, handleDragOver, handleDragEnd } = dragEvents;

  const dropAnimation: DropAnimation | null = isSmallScreen
    ? null
    : {
        ...defaultDropAnimation,
      };

  const taskInputText = useUIStore(getTaskInputText);
  const selectedCategory = useUIStore(getSelectedCategory);

  const [quadrantOrder, setQuadrantOrder] = useState([
    'ImportantUrgent',
    'ImportantNotUrgent',
    'NotImportantUrgent',
    'NotImportantNotUrgent',
  ]);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex w-full flex-wrap pt-6">
      {!(expandedQuadrant || taskInputText) && (
        <div className="absolute flex h-6 w-full -translate-y-full flex-nowrap">
          <div className="w-1/2 text-center">Urgent</div>
          <div className="w-1/2 text-center">Not Urgent</div>
        </div>
      )}
      {!(expandedQuadrant || taskInputText) && (
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
            tasks={tasks[key as MatrixKey]}
            isAnimateQuadrants={isAnimateQuadrants}
            handleToggleExpand={handleToggleExpand}
            expandedQuadrant={expandedQuadrant}
            key={key}
            quadrantKey={key as MatrixKey}
            isDragOver={dragOverQuadrant === key}
            orderIndex={quadrantOrder.indexOf(key)}
            isTypingNewTask={taskInputText.trim() !== ''}
            // isDimmed={taskInputText.trim() !== '' && selectedCategory !== key}
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
    </div>
  );
};
