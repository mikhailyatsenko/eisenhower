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
import { ToastContainer } from 'react-toastify';
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
import { TaskMatrixHeader } from './TaskMatrixHeader';

interface TaskMatrixProps {
  expandedQuadrant: MatrixKey | null;
  isAnimateByExpandQuadrant: boolean;
  handleToggleExpand: (quadrant: MatrixKey) => void;
  dragOverQuadrant: MatrixKey | null;
  isSmallScreen: boolean;
  activeTaskId: string | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const TaskMatrix: React.FC<TaskMatrixProps> = ({
  expandedQuadrant,
  isAnimateByExpandQuadrant,
  handleToggleExpand,
  dragOverQuadrant,
  isSmallScreen,
  activeTaskId,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
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
    <div className="relative flex w-full flex-wrap justify-center pt-6">
      <TaskMatrixHeader
        expandedQuadrant={expandedQuadrant}
        taskInputText={taskInputText}
      />

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
      <ToastContainer />
    </div>
  );
};
