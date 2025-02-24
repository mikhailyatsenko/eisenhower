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
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useUIStore } from '@/entities/taskMatrix/model/store/uiStore';
import { MatrixKey } from '../../@x/matrixKey';
import { MatrixQuadrants } from '../../model/consts/taskMatrixConsts';
import { getAllTasks } from '../../model/selectors/tasksSelector';
import { getIsLoading } from '../../model/selectors/uiSelectors';
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
  activeQuadrant: MatrixKey | null;
  isSmallScreen: boolean;
  activeTaskId: string | null;
}

export const TaskMatrix: React.FC<TaskMatrixProps> = ({
  expandedQuadrant,
  dragEvents,
  isAnimateQuadrants,
  handleToggleExpand,
  activeQuadrant,
  isSmallScreen,
  activeTaskId,
}) => {
  const isLoading = useUIStore(getIsLoading);

  const tasks = useTaskStore(getAllTasks);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
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
            tasks={tasks[key as MatrixKey]}
            isAnimateQuadrants={isAnimateQuadrants}
            handleToggleExpand={handleToggleExpand}
            expandedQuadrant={expandedQuadrant}
            key={key}
            quadrantKey={key as MatrixKey}
            isActive={activeQuadrant === key}
          />
        ))}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeTaskId ? (
            <TaskItem
              task={
                tasks[activeQuadrant as MatrixKey].find(
                  (t) => t.id === activeTaskId,
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
